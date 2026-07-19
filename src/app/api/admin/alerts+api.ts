import { requireAdminRole } from "@/src/lib/admin.server";
import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

/**
 * GET /api/admin/alerts - List all active alerts
 */
async function handleGet(request: Request) {

  const userId = await getAuthenticatedUserId(request);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return Response.json({ success: false, message: "User not found" }, { status: 404 });
  }
  requireAdminRole(user);

  const url = new URL(request.url || "");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const severity = url.searchParams.get("severity");
  const status = url.searchParams.get("status");

  const skip = (page - 1) * limit;

  const where: any = {};

  if (severity) {
    where.severity = severity;
  }
  if (status) {
    where.status = status;
  } else {
    where.status = "ACTIVE"; // Default to active alerts
  }

  // If ADMIN, only see alerts from their farms
  if (user.role === "ADMIN") {
    where.pond = { farm: { ownerId: user.id } };
  }

  const [alerts, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      include: {
        pond: {
          select: {
            id: true,
            name: true,
            farm: { select: { name: true } },
          },
        },
        sensorReading: {
          select: {
            temperature: true,
            ph: true,
            dissolvedOxygen: true,
            turbidity: true,
            recordedAt: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.alert.count({ where }),
  ]);

  return Response.json({
    success: true,
    data: {
      alerts,
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
 * PUT /api/admin/alerts/:id - Update alert status
 */
async function handlePut(request: Request) {
  
  const userId = await getAuthenticatedUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return Response.json({ success: false, message: "User not found" }, { status: 404 });
  }

  requireAdminRole(user);

  const url = new URL(request.url || "");
  const alertId = url.pathname.split("/").pop();

  if (!alertId) {
    return Response.json({ success: false, message: "Alert ID required" }, { status: 400 });
  }

  const { status, action } = await request.json();

  const updateData: any = {};

  if (status === "ACKNOWLEDGED") {
    updateData.status = "ACKNOWLEDGED";
    updateData.acknowledgedAt = new Date();
  } else if (status === "RESOLVED") {
    updateData.status = "RESOLVED";
    updateData.resolvedAt = new Date();
  } else if (action === "acknowledge") {
    updateData.status = "ACKNOWLEDGED";
    updateData.acknowledgedAt = new Date();
  } else if (action === "resolve") {
    updateData.status = "RESOLVED";
    updateData.resolvedAt = new Date();
  } else if (action === "reopen") {
    updateData.status = "ACTIVE";
    updateData.acknowledgedAt = null;
    updateData.resolvedAt = null;
  }

  const updatedAlert = await prisma.alert.update({
    where: { id: alertId },
    data: updateData,
    include: {
      pond: { select: { name: true } },
    },
  });

  return Response.json({
    success: true,
    message: `Alert ${updateData.status?.toLowerCase() || "updated"} successfully`,
    data: updatedAlert,
  });
}

/**
 * POST /api/admin/alerts/batch - Batch update alerts
 */
async function handleBatch(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  const user = await prisma.user.findUnique({ where: userId })

  requireAdminRole(user);

  const { alertIds, action } = await request.json();

  if (!alertIds || alertIds.length === 0) {
    return Response.json({ success: false, message: "Alert IDs required" }, { status: 400 });
  }

  const updateData: any = {};

  if (action === "acknowledge") {
    updateData.status = "ACKNOWLEDGED";
    updateData.acknowledgedAt = new Date();
  } else if (action === "resolve") {
    updateData.status = "RESOLVED";
    updateData.resolvedAt = new Date();
  } else {
    return Response.json({ success: false, message: "Invalid action" }, { status: 400 });
  }

  const result = await prisma.alert.updateMany({
    where: { id: { in: alertIds } },
    data: updateData,
  });

  return Response.json({
    success: true,
    message: `${result.count} alerts updated successfully`,
    data: { updatedCount: result.count },
  });
}

export async function GET(request: Request) {
  try {
    return await handleGet(request);
  } catch (error) {
    console.error("Alerts API GET error:", error);
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
    console.error("Alerts API PUT error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    return await handleBatch(request);
  } catch (error) {
    console.error("Alerts API POST error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
