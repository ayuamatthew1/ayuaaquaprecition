import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

function getPondIdFromRequest(request: Request) {
  const match = request.url.match(/\/api\/ponds\/([^/]+)(?:\/)?$/);
  return match?.[1] ?? null;
}

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const pondId = getPondIdFromRequest(request);
    if (!pondId) {
      return Response.json({ success: false, message: "Pond ID is required." }, { status: 400 });
    }

    const pond = await prisma.pond.findFirst({
      where: { id: pondId, farm: { ownerId: userId } },
      select: {
        id: true,
        name: true,
        type: true,
        capacity: true,
        waterVolume: true,
        device: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            status: true,
            batteryLevel: true,
            signalStrength: true,
            firmwareVersion: true,
            installedAt: true,
            lastSeenAt: true,
          },
        },
        fishBatches: {
          orderBy: { stockedAt: "desc" },
          take: 1,
          select: { species: true, quantity: true, stockedAt: true },
        },
        feedingSchedules: {
          where: { isActive: true },
          orderBy: { feedTime: "asc" },
          take: 5,
          select: {
            id: true,
            feedType: true,
            quantity: true,
            unit: true,
            feedTime: true,
            repeatDays: true,
            isActive: true,
          },
        },
        alerts: {
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            title: true,
            message: true,
            severity: true,
            status: true,
            createdAt: true,
            resolvedAt: true,
          },
        },
        waterQualityPredictions: {
          orderBy: { generatedAt: "desc" },
          take: 1,
          select: {
            overallScore: true,
            riskLevel: true,
            summary: true,
            recommendations: true,
            confidence: true,
          },
        },
      },
    });

    if (!pond) {
      return Response.json({ success: false, message: "Pond not found." }, { status: 404 });
    }

    const latestFishBatch = pond.fishBatches[0] ?? null;
    const deviceId = pond.device?.id ?? null;

    const readings = deviceId
      ? await prisma.sensorReading.findMany({
        where: { deviceId },
        orderBy: { recordedAt: "asc" },
        take: 24,
        select: {
          temperature: true,
          ph: true,
          dissolvedOxygen: true,
          turbidity: true,
          ammonia: true,
          conductivity: true,
          salinity: true,
          waterLevel: true,
          recordedAt: true,
        },
      })
      : [];

    return Response.json({
      success: true,
      data: {
        pond: {
          id: pond.id,
          name: pond.name,
          type: pond.type,
          capacity: pond.capacity,
          waterVolume: pond.waterVolume ?? pond.capacity ?? 0,
          species: latestFishBatch?.species ?? null,
          fishCount: latestFishBatch?.quantity ?? 0,
          hasFish: Boolean(latestFishBatch?.quantity && latestFishBatch.quantity > 0),
          hasDevice: Boolean(pond.device),
        },
        device: pond.device
          ? {
            id: pond.device.id,
            name: pond.device.name,
            serialNumber: pond.device.serialNumber,
            status: pond.device.status,
            batteryLevel: pond.device.batteryLevel,
            signalStrength: pond.device.signalStrength,
            firmwareVersion: pond.device.firmwareVersion,
            installedAt: pond.device.installedAt,
            lastSeenAt: pond.device.lastSeenAt,
          }
          : null,
        readings: readings.map((reading) => ({
          temperature: reading.temperature,
          ph: reading.ph,
          dissolvedOxygen: reading.dissolvedOxygen,
          turbidity: reading.turbidity,
          ammonia: reading.ammonia,
          conductivity: reading.conductivity,
          salinity: reading.salinity,
          waterLevel: reading.waterLevel,
          recordedAt: reading.recordedAt.toISOString(),
        })),
        latestReading: readings.length > 0
          ? {
            temperature: readings[readings.length - 1].temperature,
            ph: readings[readings.length - 1].ph,
            dissolvedOxygen: readings[readings.length - 1].dissolvedOxygen,
            turbidity: readings[readings.length - 1].turbidity,
            ammonia: readings[readings.length - 1].ammonia,
            conductivity: readings[readings.length - 1].conductivity,
            salinity: readings[readings.length - 1].salinity,
            waterLevel: readings[readings.length - 1].waterLevel,
            recordedAt: readings[readings.length - 1].recordedAt.toISOString(),
          }
          : null,
        schedules: pond.feedingSchedules.map((schedule) => ({
          id: schedule.id,
          feedType: schedule.feedType,
          quantity: schedule.quantity,
          unit: schedule.unit,
          feedTime: schedule.feedTime.toISOString(),
          repeatDays: schedule.repeatDays,
          isActive: schedule.isActive,
          time: new Date(schedule.feedTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
        alerts: pond.alerts.map((alert) => ({
          id: alert.id,
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          status: alert.status,
          createdAt: alert.createdAt.toISOString(),
          resolvedAt: alert.resolvedAt?.toISOString() ?? null,
        })),
        prediction: pond.waterQualityPredictions[0] ?? null,
      },
    });
  } catch (error) {
    console.error("Pond detail error:", error);
    return Response.json({ success: false, message: "Unable to load pond details." }, { status: 500 });
  }
}
