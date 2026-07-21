import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { z } from "zod";

const updateScheduleSchema = z.object({
  isActive: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const url = new URL(request.url);
    const scheduleId = url.pathname.split("/").filter(Boolean).pop();

    if (!scheduleId) {
      return Response.json({ success: false, message: "Schedule id is required." }, { status: 400 });
    }

    const data = updateScheduleSchema.parse(await request.json());
    const existing = await prisma.feedingSchedule.findFirst({
      where: { id: scheduleId, pond: { farm: { ownerId: userId } } },
      select: { id: true },
    });

    if (!existing) {
      return Response.json({ success: false, message: "Schedule not found." }, { status: 404 });
    }

    const updated = await prisma.feedingSchedule.update({
      where: { id: scheduleId },
      data: { isActive: data.isActive ?? true },
      select: { id: true, isActive: true },
    });

    return Response.json({ success: true, data: updated });
  } catch (error) {
    const isValidationError = error instanceof z.ZodError;
    return Response.json(
      { success: false, message: isValidationError ? "Please enter valid updates." : "Unable to update feeding schedule." },
      { status: isValidationError ? 400 : 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const scheduleId = url.pathname.split("/").filter(Boolean).pop();

  if (!scheduleId) {
    return Response.json({ success: false, message: "Schedule id is required." }, { status: 400 });
  }

  const existing = await prisma.feedingSchedule.findFirst({
    where: { id: scheduleId, pond: { farm: { ownerId: userId } } },
    select: { id: true },
  });

  if (!existing) {
    return Response.json({ success: false, message: "Schedule not found." }, { status: 404 });
  }

  await prisma.feedingSchedule.delete({ where: { id: scheduleId } });
  return Response.json({ success: true, message: "Schedule deleted." });
}
