import { prisma } from "@/src/lib/db.server";

export async function GET(_request: Request) {
  try {
    const devices = await prisma.device.findMany({
      where: {
        isListed: true,
        ownerId: null,
      },
      select: {
        id: true,
        name: true,
        serialNumber: true,
        firmwareVersion: true,
        listedPrice: true,
        status: true,
        notes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ success: true, data: { devices } });
  } catch (error) {
    console.error("Device listings GET error:", error);
    return Response.json({ success: false, message: error instanceof Error ? error.message : "Server error" }, { status: 500 });
  }
}
