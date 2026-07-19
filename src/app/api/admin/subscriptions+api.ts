import { requireAdminRole } from "@/src/lib/admin.server";
import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

/**
 * GET /api/admin/subscriptions - List all subscriptions
 */
async function handleGet(request: Request) {
  const userId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  requireAdminRole(user);

  const url = new URL(request.url || "");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const status = url.searchParams.get("status");
  const plan = url.searchParams.get("plan");

  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }
  if (plan) {
    where.plan = plan;
  }

  // If ADMIN, only see subscriptions for their farms
  if (user.role === "ADMIN") {
    where.farm = { ownerId: user.id };
  }

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        farm: {
          select: {
            id: true,
            name: true,
            owner: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.count({ where }),
  ]);

  // Calculate days remaining
  const subscriptionsWithDaysRemaining = subscriptions.map((sub: { endsAt: { getTime: () => number; }; }) => ({
    ...sub,
    daysRemaining: Math.ceil((sub.endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  }));

  return Response.json({
    success: true,
    data: {
      subscriptions: subscriptionsWithDaysRemaining,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}

/**
 * PUT /api/admin/subscriptions/:id - Update subscription
 */
async function handlePut(request: Request) {
  const userId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  requireAdminRole(user, ["SUPER_ADMIN"]); // Only SUPER_ADMIN can modify subscriptions

  const url = new URL(request.url || "");
  const subscriptionId = url.pathname.split("/").pop();

  if (!subscriptionId) {
    return Response.json(
      { success: false, message: "Subscription ID required" },
      { status: 400 }
    );
  }

  const { status, plan, endsAt } = await request.json();

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      ...(status && { status }),
      ...(plan && { plan }),
      ...(endsAt && { endsAt: new Date(endsAt) }),
    },
    include: {
      farm: { select: { name: true } },
    },
  });

  return Response.json({
    success: true,
    message: "Subscription updated successfully",
    data: updatedSubscription,
  });
}

export async function GET(request: Request) {
  try {
    return await handleGet(request);
  } catch (error) {
    console.error("Subscriptions API GET error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    return await handlePut(request);
  } catch (error) {
    console.error("Subscriptions API PUT error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
