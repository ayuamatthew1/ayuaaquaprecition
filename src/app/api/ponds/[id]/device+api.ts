import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { z } from "zod";

const createDeviceSchema = z.object({
  pondId: z.string().trim().min(2, "Pond ID is required."),
  deviceId: z.string().trim().min(2, "Device ID is required."),

});

function getPondIdFromRequest(request: Request) {
  const match = request.url.match(/\/api\/ponds\/([^/]+)\/device/);
  return match?.[1] ?? null;
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const pondId = getPondIdFromRequest(request);

    if (!pondId) {
      return Response.json({ success: false, message: "Pond ID is required." }, { status: 400 });
    }

    const data = createDeviceSchema.parse(await request.json());

    console.log("Pond id from server: ", data.pondId)
    console.log("Device id from server: ", data.deviceId)

    const pond = await prisma.pond.findFirst({
      where: { id: data.pondId, farm: { ownerId: userId } },
      select: { id: true },
    });

    console.log("Pond from server: ", pond)

    if (!pond) {
      return Response.json({ success: false, message: "Pond not found." }, { status: 404 });
    }

    const existingDevice = await prisma.device.findFirst({ where: { pondId } });

    if (existingDevice) {
      return Response.json({ success: false, message: "This pond already has a device assigned." }, { status: 409 });
    }


    const device = await prisma.device.update({
      where: { id: data.deviceId },
      data: {
        pondId: pond.id,
        installedAt: new Date(),
        lastSeenAt: new Date()
      }
    });

    return Response.json({ success: true, data: device }, { status: 201 });
  } catch (error) {
    console.error("Create device error:", error);

    if (error instanceof z.ZodError) {
      return Response.json({ success: false, message: "Please provide valid device details." }, { status: 400 });
    }

    return Response.json({ success: false, message: "Unable to add device." }, { status: 500 });
  }
}
