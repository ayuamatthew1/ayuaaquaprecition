import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

export async function GET(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized request.",
        },
        { status: 401 }
      );
    }

    const devices = await prisma.device.findMany({
      where: {
        ownerId: userId,
        pondId: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log("Devices from API:", devices);

    return Response.json({
      success: true,
      message: devices.length
        ? "Devices retrieved successfully."
        : "No unassigned devices found.",
      data: {
        devices,
      },
    });
  } catch (error) {
    console.error("Error getting user devices:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to get user devices.",
      },
      { status: 500 }
    );
  }
}