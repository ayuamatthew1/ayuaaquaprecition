import { isAdmin, requireAdminRole } from "@/src/lib/admin.server";
import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";


/**
 * GET /api/admin/dashboard - Dashboard overview statistics
 */
export async function GET(request: Request) {
  try {

    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    requireAdminRole(user);

    let farmFilter = {};
    let userFilter = {};

    // If ADMIN (not SUPER_ADMIN), only see their data
    if (isAdmin(user.role)) {
      farmFilter = { ownerId: user.id };
      userFilter = { farms: { some: { ownerId: user.id } } };
    }

    // Get statistics
    const totalUsers = await prisma.user.count({ where: userFilter });
    const activeFarms = await prisma.farm.count({
      where: { ...farmFilter, status: "ACTIVE" },
    });

    const totalPonds = await prisma.pond.count({
      where: { farm: farmFilter || { ownerId: user.id } },
    });

    const onlineDevices = await prisma.device.count({
      where: { status: "ONLINE" },
    });

    const criticalAlerts = await prisma.alert.count({
      where: {
        severity: { in: ["CRITICAL", "HIGH"] },
        status: "ACTIVE",
      },
    });

    const totalSubscriptions = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    return Response.json({
      success: true,
      data: {
        totalUsers,
        activeFarms,
        totalPonds,
        onlineDevices,
        criticalAlerts,
        totalSubscriptions,
        timestamp: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error("Dashboard API error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
