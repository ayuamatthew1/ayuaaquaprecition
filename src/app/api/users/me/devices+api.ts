import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const devices = await prisma.device.findMany({
      where: { ownerId: userId },
      include: {
        pond: {
          select: {
            id: true,
            name: true,
            farm: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ success: true, data: { devices } });
  } catch (error) {
    console.error("User devices GET error:", error);
    return Response.json({ success: false, message: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}
