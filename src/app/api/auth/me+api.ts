import { getAuthenticatedUserId, toAuthUser } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);

  if (!userId) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || user.status !== "ACTIVE") {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  return Response.json({ success: true, data: toAuthUser(user) });
}
