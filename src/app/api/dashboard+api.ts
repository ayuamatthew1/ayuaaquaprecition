import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

type DashboardPond = {
  id: string;
  name: string;
  device: {
    id: string;
    sensorReadings: Array<{
      id: string;
      temperature: number;
      ph: number;
      dissolvedOxygen: number;
      turbidity: number;
      ammonia: number | null;
      recordedAt: Date;
    }>;
  } | null;
};

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const ponds: DashboardPond[] = await prisma.pond.findMany({
      where: { farm: { ownerId: userId } },
      select: {
        id: true,
        name: true,
        device: {
          select: {
            id: true,
            sensorReadings: {
              orderBy: { recordedAt: "desc" },
              take: 1,
              select: {
                id: true,
                temperature: true,
                ph: true,
                dissolvedOxygen: true,
                turbidity: true,
                ammonia: true,
                recordedAt: true,
              },
            },
          },
        },
      },
    });

    const latestReading = ponds
      .flatMap((pond) => {
        const reading = pond.device?.sensorReadings[0];
        return reading
          ? [{ ...reading, deviceId: pond.device!.id, pondId: pond.id, pondName: pond.name }]
          : [];
      })
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime())[0];

    return Response.json({
      success: true,
      data: latestReading
        ? { ...latestReading, recordedAt: latestReading.recordedAt.toISOString() }
        : null,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return Response.json(
      { success: false, message: "Unable to load dashboard data." },
      { status: 500 },
    );
  }
}
