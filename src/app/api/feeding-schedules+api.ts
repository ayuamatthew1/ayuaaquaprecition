import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { z } from "zod";

const createScheduleSchema = z.object({
  pondId: z.string().trim().min(1, "Select a pond."),
  feedType: z.string().trim().min(1, "Feed type is required."),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit: z.string().trim().min(1, "Unit is required."),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  repeatDays: z.array(z.string()).optional(),
});

const updateScheduleSchema = z.object({
  isActive: z.boolean().optional(),
});

function formatFeedTime(hour: number, minute: number) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const schedules = await prisma.feedingSchedule.findMany({
    where: {
      pond: {
        farm: { ownerId: userId },
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      pondId: true,
      feedType: true,
      quantity: true,
      unit: true,
      feedTime: true,
      repeatDays: true,
      isActive: true,
      pond: {
        select: {
          name: true,
          fishBatches: {
            orderBy: { stockedAt: "desc" },
            take: 1,
            select: { species: true },
          },
        },
      },
    },
  });

  return Response.json({
    success: true,
    data: schedules.map((schedule) => ({
      id: schedule.id,
      pondId: schedule.pondId,
      feedType: schedule.feedType,
      quantity: schedule.quantity,
      unit: schedule.unit,
      feedTime: schedule.feedTime.toISOString(),
      repeatDays: schedule.repeatDays,
      isActive: schedule.isActive,
      pondName: schedule.pond.name,
      species: schedule.pond.fishBatches[0]?.species ?? null,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const data = createScheduleSchema.parse(await request.json());

    const pond = await prisma.pond.findFirst({
      where: { id: data.pondId, farm: { ownerId: userId } },
      select: { id: true, name: true },
    });

    if (!pond) {
      return Response.json({ success: false, message: "Pond not found." }, { status: 404 });
    }

    const schedule = await prisma.feedingSchedule.create({
      data: {
        pondId: pond.id,
        feedType: data.feedType as any,
        quantity: data.quantity,
        unit: data.unit,
        feedTime: formatFeedTime(data.hour, data.minute),
        repeatDays: data.repeatDays ?? ["DAILY"],
        isActive: true,
      },
      select: {
        id: true,
        pondId: true,
        feedType: true,
        quantity: true,
        unit: true,
        feedTime: true,
        repeatDays: true,
        isActive: true,
      },
    });

    return Response.json({
      success: true,
      data: {
        ...schedule,
        feedTime: schedule.feedTime.toISOString(),
        pondName: pond.name,
        species: null,
      },
    }, { status: 201 });
  } catch (error) {
    const isValidationError = error instanceof z.ZodError;
    return Response.json(
      { success: false, message: isValidationError ? "Please enter valid schedule details." : "Unable to create feeding schedule." },
      { status: isValidationError ? 400 : 500 },
    );
  }
}

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

export async function POST_COMPLETE(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const scheduleId = url.pathname.split("/").filter(Boolean).pop();

  if (!scheduleId) {
    return Response.json({ success: false, message: "Schedule id is required." }, { status: 400 });
  }

  const schedule = await prisma.feedingSchedule.findFirst({
    where: { id: scheduleId, pond: { farm: { ownerId: userId } } },
    select: { id: true, quantity: true, unit: true, feedType: true },
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
