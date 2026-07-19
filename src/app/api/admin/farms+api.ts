import { requireAdminRole, validateFarmAccess } from "@/src/lib/admin.server";
import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

/**
 * GET /api/admin/farms - List all farms accessible to admin
 */
async function handleGet(request: Request) {

  const userId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  requireAdminRole(user);

  const url = new URL(request.url || "");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const status = url.searchParams.get("status");

  const skip = (page - 1) * limit;

  const where: any = {
    ...(status && { status }),
  };

  // If ADMIN (not SUPER_ADMIN), only see their farms
  if (user.role === "ADMIN") {
    where.ownerId = user.id;
  }

  const [farms, total] = await Promise.all([
    prisma.farm.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        status: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        ponds: { select: { id: true } },
        subscription: { select: { plan: true, status: true, endsAt: true } },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.farm.count({ where }),
  ]);

  // Add pond count to each farm
  const farmsWithStats = farms.map((farm: any) => ({
    ...farm,
    pondCount: farm.ponds.length,
    ponds: undefined,
  }));

  return Response.json({
    success: true,
    data: {
      farms: farmsWithStats,
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
 * PUT /api/admin/farms/:id - Update farm details or status
 */
async function handlePut(request: Request) {
  const userId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  requireAdminRole(user);


  const url = new URL(request.url || "");
  const farmId = url.pathname.split("/").pop();

  if (!farmId) {
    return Response.json({ success: false, message: "Farm ID required" }, { status: 400 });
  }

  await validateFarmAccess(user, farmId, prisma);

  const { name, description, address, city, state, country, latitude, longitude, status } =
    await request.json();

  const updatedFarm = await prisma.farm.update({
    where: { id: farmId },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(country !== undefined && { country }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(status && { status }),
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      owner: { select: { email: true } },
    },
  });

  return Response.json({
    success: true,
    message: "Farm updated successfully",
    data: updatedFarm,
  });
}

/**
 * GET /api/admin/farms/:id/overview - Get detailed farm overview with stats
 */
async function handleGetOverview(request: Request) {
  const userId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  requireAdminRole(user);


  const url = new URL(request.url || "");
  const farmId = url.pathname.split("/")[url.pathname.split("/").length - 2];

  if (!farmId) {
    return Response.json({ success: false, message: "Farm ID required" }, { status: 400 });
  }

  await validateFarmAccess(user, farmId, prisma);

  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    include: {
      ponds: {
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          capacity: true,
          waterVolume: true,
          device: { select: { status: true } },
          fishBatches: { select: { quantity: true } },
        },
      },
      subscription: true,
    },
  });

  if (!farm) {
    return Response.json({ success: false, message: "Farm not found" }, { status: 404 });
  }

  const alerts = await prisma.alert.count({
    where: {
      pond: { farmId },
      status: "ACTIVE",
    },
  });

  return Response.json({
    success: true,
    data: {
      ...farm,
      stats: {
        totalPonds: farm.ponds.length,
        activePonds: farm.ponds.filter((p: any) => p.status === "ACTIVE").length,
        onlineDevices: farm.ponds.filter((p: any) => p.device?.status === "ONLINE").length,
        activeAlerts: alerts,
      },
    },
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url || "");
    if (url.pathname.includes("overview")) {
      return await handleGetOverview(request);
    }
    return await handleGet(request);
  } catch (error) {
    console.error("Farms API GET error:", error);
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
    console.error("Farms API PUT error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
