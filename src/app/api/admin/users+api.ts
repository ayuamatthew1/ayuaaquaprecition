import { UserRole } from "@/prisma/generated/prisma/client";
import { requireAdminRole } from "@/src/lib/admin.server";
import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

/**
 * GET /api/admin/users - List all users (SUPER_ADMIN) or users in admin's farms
 */
async function handleGet(request: Request) {

  const userId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  requireAdminRole(user);

  const page = parseInt(new URL(request.url || "").searchParams.get("page") || "1");
  const limit = parseInt(new URL(request.url || "").searchParams.get("limit") || "10");
  const role = new URL(request.url || "").searchParams.get("role");
  const status = new URL(request.url || "").searchParams.get("status");

  const skip = (page - 1) * limit;

  const where: any = {};
  if (role && Object.values(UserRole).includes(role as UserRole)) {
    where.role = role;
  }
  if (status) {
    where.status = status;
  }

  // SUPER_ADMIN sees all, ADMIN sees only their farm owners
  if (user.role === "ADMIN") {
    where.farms = { some: { ownerId: user.id } };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return Response.json({
    success: true,
    data: {
      users,
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
 * PUT /api/admin/users/:id - Update user role/status
 */
async function handlePut(request: Request) {

  const superAdminId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: superAdminId } });
  requireAdminRole(user, [UserRole.SUPER_ADMIN]); // Only SUPER_ADMIN can modify users

  const url = new URL(request.url || "");
  const userId = url.pathname.split("/").pop();

  if (!userId) {
    return Response.json({ success: false, message: "User ID required" }, { status: 400 });
  }

  const { role, status } = await request.json();

  if (role && !Object.values(UserRole).includes(role)) {
    return Response.json({ success: false, message: "Invalid role" }, { status: 400 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(role && { role }),
      ...(status && { status }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return Response.json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
}

/**
 * DELETE /api/admin/users/:id - Soft delete user
 */
async function handleDelete(request: Request) {

  const superAdminId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: superAdminId } });
  requireAdminRole(user, [UserRole.SUPER_ADMIN]); // Only SUPER_ADMIN can modify users

  const url = new URL(request.url || "");
  const userId = url.pathname.split("/").pop();

  if (!userId) {
    return Response.json({ success: false, message: "User ID required" }, { status: 400 });
  }

  const deletedUser = await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
    select: { id: true, email: true },
  });

  return Response.json({
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
}

export async function GET(request: Request) {
  try {
    return await handleGet(request);
  } catch (error) {
    console.error("Users API GET error:", error);
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
    console.error("Users API PUT error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    return await handleDelete(request);
  } catch (error) {
    console.error("Users API DELETE error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
