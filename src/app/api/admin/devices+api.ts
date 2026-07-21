import { requireAdminRole, validatePondAccess } from "@/src/lib/admin.server";
import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { z } from "zod";

const createDeviceSchema = z.object({
  name: z.string().trim().min(2),
  serialNumber: z.string().trim().min(2),
  firmwareVersion: z.string().trim().optional(),
  hardwareVersion: z.string().trim().optional(),
  macAddress: z.string().trim().optional(),
  listedPrice: z.number().positive().optional(),
  isListed: z.boolean().optional(),
  pondId: z.string().cuid().optional(),
});

/**
 * GET /api/admin/devices - List all devices or filter by pond/farm
 */
async function handleGet(request: Request) {

  const userId = await getAuthenticatedUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  requireAdminRole(user);

  const url = new URL(request.url || "");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const status = url.searchParams.get("status");
  const pondId = url.searchParams.get("pondId");
  const isListed = url.searchParams.get("isListed");
  const owned = url.searchParams.get("owned");

  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (isListed === "true") {
    where.isListed = true;
  } else if (isListed === "false") {
    where.isListed = false;
  }

  if (owned === "true") {
    where.ownerId = { not: null };
  } else if (owned === "false") {
    where.ownerId = null;
  }

  if (pondId) {
    await validatePondAccess(user, pondId, prisma);
    where.pondId = pondId;
  } else if (user.role === "ADMIN") {
    // ADMIN sees devices only in their ponds or assigned to their farms
    where.OR = [
      { pond: { farm: { ownerId: user.id } } },
      { owner: { role: "FARMER" }, pond: { farm: { ownerId: user.id } } },
    ];
  }

  const [devices, total] = await Promise.all([
    prisma.device.findMany({
      where,
      include: {
        pond: {
          select: {
            id: true,
            name: true,
            farm: { select: { name: true } },
          },
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sensorReadings: {
          take: 1,
          orderBy: { recordedAt: "desc" },
          select: {
            temperature: true,
            ph: true,
            dissolvedOxygen: true,
            turbidity: true,
            recordedAt: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.device.count({ where }),
  ]);

  return Response.json({
    success: true,
    data: {
      devices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}

async function handlePost(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  requireAdminRole(user, ["SUPER_ADMIN"]);

  try {
    const data = createDeviceSchema.parse(await request.json());

    const device = await prisma.device.create({
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        firmwareVersion: data.firmwareVersion || null,
        hardwareVersion: data.hardwareVersion || null,
        macAddress: data.macAddress || null,
        status: "OFFLINE",
        isListed: data.isListed ?? false,
        listedPrice: data.listedPrice ?? null,
        pondId: data.pondId ?? null,
        listedById: userId,
      },
    });

    return Response.json({ success: true, data: device }, { status: 201 });
  } catch (error) {
    console.error("Devices API POST error:", error);
    const isValidationError = error instanceof z.ZodError;
    return Response.json(
      { success: false, message: isValidationError ? "Please provide valid device data." : error instanceof Error ? error.message : "Server error" },
      { status: isValidationError ? 400 : 500 },
    );
  }
}

/**
 * PUT /api/admin/devices/:id - Update device (technician action)
 */
async function handlePut(request: Request) {

  const userId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: userId } })
  requireAdminRole(user, ["SUPER_ADMIN", "ADMIN", "TECHNICIAN"]);

  const url = new URL(request.url || "");
  const deviceId = url.pathname.split("/").pop();

  if (!deviceId) {
    return Response.json({ success: false, message: "Device ID required" }, { status: 400 });
  }

  const { status, firmwareVersion, notes, action } = await request.json();

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { pondId: true },
  });

  if (!device) {
    return Response.json({ success: false, message: "Device not found" }, { status: 404 });
  }

  await validatePondAccess(user, device.pondId, prisma);

  const updateData: any = {};

  if (action === "calibrate") {
    // Mark calibration timestamp
    updateData.updatedAt = new Date();
    updateData.notes = notes || "Device calibrated";
  } else if (action === "restart") {
    updateData.status = "OFFLINE"; // Will come back online when it reconnects
    updateData.notes = notes || `Device restarted by ${user.firstname}`;
  } else {
    if (status) updateData.status = status;
    if (firmwareVersion) updateData.firmwareVersion = firmwareVersion;
    if (notes !== undefined) updateData.notes = notes;
  }

  const updatedDevice = await prisma.device.update({
    where: { id: deviceId },
    data: updateData,
    include: {
      pond: { select: { name: true } },
    },
  });

  return Response.json({
    success: true,
    message: "Device updated successfully",
    data: updatedDevice,
  });
}

/**
 * GET /api/admin/devices/:id/history - Get device sensor history
 */
async function handleGetHistory(request: Request) {

  const userId = await getAuthenticatedUserId(request)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  requireAdminRole(user);

  const url = new URL(request.url || "");
  const deviceId = url.pathname.split("/")[url.pathname.split("/").length - 2];
  const hours = parseInt(url.searchParams.get("hours") || "24");

  if (!deviceId) {
    return Response.json({ success: false, message: "Device ID required" }, { status: 400 });
  }

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { pondId: true },
  });

  if (!device) {
    return Response.json({ success: false, message: "Device not found" }, { status: 404 });
  }

  await validatePondAccess(user, device.pondId, prisma);

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const readings = await prisma.sensorReading.findMany({
    where: {
      deviceId,
      recordedAt: { gte: since },
    },
    orderBy: { recordedAt: "desc" },
    take: 100,
  });

  return Response.json({
    success: true,
    data: {
      deviceId,
      readings,
      period: `${hours} hours`,
      count: readings.length,
    },
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url || "");
    if (url.pathname.includes("history")) {
      return await handleGetHistory(request);
    }
    return await handleGet(request);
  } catch (error) {
    console.error("Devices API GET error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    return await handlePost(request);
  } catch (error) {
    console.error("Devices API POST error:", error);
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
    console.error("Devices API PUT error:", error);
    return Response.json(
      { success: false, message: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
