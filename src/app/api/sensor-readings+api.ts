import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";

export async function POST(request: Request) {

  try {
    const userId = await getAuthenticatedUserId(request);
    console.log('UserId: ', userId)

    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 })
    }

    const data = await request.json();
    console.log("DATA: ", data)
    const device = await prisma.device.findUnique({ where: { id: data.deviceId } });
    if (!device) {
      return Response.json({ success: false, message: "Device NOT found." }, { status: 404 })
    }

    const readings = await prisma.sensorReading.findFirst({
      where: { deviceId: data.deviceId },
      orderBy: { recordedAt: "desc" },
      take: 1
    })
    if (readings) {
      const lastReadingDate = new Date(readings.recordedAt).getTime()
      const currentTime = Date.now()
      const twoHours = 2 * 60 * 60 * 1000
      const elapseTime = currentTime - lastReadingDate

      if (elapseTime < twoHours) {
        // 1. Get total remaining time in milliseconds
        const remainingMs = twoHours - elapseTime

        // 2. Extract whole hours and remaining minutes
        const hours = Math.floor(remainingMs / (1000 * 60 * 60))
        const minutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60))

        // 3. Format string dynamically based on the values
        let timeString = ""
        if (hours > 0) {
          timeString += `${hours} hour${hours > 1 ? 's' : ''} and `
        }
        timeString += `${minutes} minute${minutes !== 1 ? 's' : ''}`

        return Response.json(
          { success: false, message: `Too many requests, try again in ${timeString}.` },
          { status: 429 }
        )
      }
    }


    await prisma.sensorReading.create({ data })

    return Response.json({ success: true, message: "Reading created successfully." }, {})

  } catch (error) {
    console.error("Error Simulating Reading: ", error)
    return Response.json({
      success: false,
      messages: error instanceof Error ? error.message : "Failed to record reading."
    })
  }
}