import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const scheduleId = url.pathname.split("/").filter(Boolean).slice(-2, -1)[0];

  if (!scheduleId) {
    return Response.json({ success: false, message: "Schedule id is required." }, { status: 400 });
  }

  const schedule = await prisma.feedingSchedule.findFirst({
    where: { id: scheduleId, pond: { farm: { ownerId: userId } } },
    select: { id: true, quantity: true, feedType: true },
  });

  if (!schedule) {
    return Response.json({ success: false, message: "Schedule not found." }, { status: 404 });
  }

  const history = await prisma.feedHistory.create({
    data: {
      scheduleId: schedule.id,
      completedById: userId,
      quantity: schedule.quantity,
      fedAt: new Date(),
      notes: `${schedule.feedType} feed completed`,
    },
    select: { id: true, fedAt: true },
  });

  return Response.json({ success: true, data: history });
}
