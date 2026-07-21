import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { z } from "zod";

const purchaseDeviceSchema = z.object({
  deviceId: z.string().cuid(),
});

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const data = purchaseDeviceSchema.parse(await request.json());

    const purchase = await prisma.$transaction(async (tx: any) => {
      const device = await tx.device.findUnique({
        where: { id: data.deviceId },
        select: {
          id: true,
          isListed: true,
          ownerId: true,
          listedPrice: true,
        },
      });

      if (!device) {
        throw new Error("Device not found.");
      }

      if (!device.isListed || device.ownerId) {
        throw new Error("Device is not available for purchase.");
      }

      const purchase = await tx.purchase.create({
        data: {
          buyerId: userId,
          deviceId: data.deviceId,
          price: device.listedPrice ?? 0,
          status: "COMPLETED",
        },
        select: {
          id: true,
          deviceId: true,
          price: true,
          status: true,
          createdAt: true,
        },
      });

      await tx.device.update({
        where: { id: data.deviceId },
        data: {
          ownerId: userId,
          isListed: false,
          listedPrice: null,
        },
      });

      return purchase;
    });

    return Response.json({ success: true, data: purchase }, { status: 201 });
  } catch (error) {
    console.error("Device purchase POST error:", error);
    const isValidationError = error instanceof z.ZodError;
    const message = isValidationError
      ? "Invalid purchase request."
      : error instanceof Error
        ? error.message
        : "Server error";

    const status = isValidationError ? 400 : error instanceof Error && error.message === "Device not found." ? 404 : 409;

    return Response.json({ success: false, message }, { status });
  }
}
