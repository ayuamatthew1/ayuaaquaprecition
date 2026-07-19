import { User, UserRole } from "@/prisma/generated/prisma/client";

/**
 * Admin authorization middleware
 * Checks if user has appropriate role for admin dashboard
 */
export function requireAdminRole(user: User | null, requiredRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN]) {
  if (!user) {
    throw new Error("Unauthorized: No user found");
  }

  if (!requiredRoles.includes(user.role)) {
    throw new Error(`Forbidden: User role ${user.role} not allowed for this operation`);
  }

  return user;
}

/**
 * Check if user is SUPER_ADMIN
 */
export function isSuperAdmin(userRole: string): boolean {
  return userRole === UserRole.SUPER_ADMIN;
}

/**
 * Check if user is ADMIN
 */
export function isAdmin(userRole: string): boolean {
  return userRole === UserRole.ADMIN;
}

/**
 * Check if user is TECHNICIAN
 */
export function isTechnician(userRole: string): boolean {
  return userRole === UserRole.TECHNICIAN;
}

/**
 * Get visibility scope for admin user
 * SUPER_ADMIN sees all, ADMIN sees only their assigned farms
 */
export function getAdminScope(user: User) {
  if (user.role === UserRole.SUPER_ADMIN) {
    return { type: "GLOBAL" as const };
  }
  if (user.role === UserRole.ADMIN) {
    return { type: "REGION" as const, userId: user.id };
  }
  return null;
}

/**
 * Build query filter based on admin scope
 */
export function buildScopeFilter(user: User, context?: { farmId?: string; pondId?: string }) {
  if (user.role === UserRole.SUPER_ADMIN) {
    return {}; // No filter, see everything
  }

  if (user.role === UserRole.ADMIN) {
    // Admins can only see farms they own
    return {
      ownerId: user.id,
    };
  }

  if (user.role === UserRole.TECHNICIAN) {
    // Technicians can see devices in assigned ponds
    if (context?.pondId) {
      return { pond: { id: context.pondId } };
    }
    return {}; // Limited visibility
  }

  throw new Error("Invalid user role for scope filter");
}

/**
 * Validate admin can access farm
 */
export async function validateFarmAccess(user: User, farmId: string, prisma: any) {
  if (user.role === UserRole.SUPER_ADMIN) {
    return true; // SUPER_ADMIN can access any farm
  }

  if (user.role === UserRole.ADMIN) {
    // ADMIN can only access their own farms
    const farm = await prisma.farm.findUnique({
      where: { id: farmId },
      select: { ownerId: true },
    });

    if (!farm || farm.ownerId !== user.id) {
      throw new Error("Forbidden: You can only access your own farms");
    }
    return true;
  }

  throw new Error("Forbidden: User role cannot access farm data");
}

/**
 * Validate admin can access pond
 */
export async function validatePondAccess(user: User, pondId: string, prisma: any) {
  const pond = await prisma.pond.findUnique({
    where: { id: pondId },
    select: { farm: { select: { ownerId: true } } },
  });

  if (!pond) {
    throw new Error("Pond not found");
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  if (user.role === UserRole.ADMIN) {
    if (pond.farm.ownerId !== user.id) {
      throw new Error("Forbidden: You can only access ponds in your own farms");
    }
    return true;
  }

  if (user.role === UserRole.TECHNICIAN) {
    // Technicians can access if assigned to pond (implementation depends on your assignment logic)
    return true;
  }

  throw new Error("Forbidden: User role cannot access pond data");
}
