import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { z } from "zod";

const createPondSchema = z.object({
  name: z.string().trim().min(2, "Pond name must be at least 2 characters.").max(80),
  type: z.enum(["EARTHEN", "CONCRETE", "TARPAULIN", "FIBER", "PLASTIC"]),
  capacity: z.number().positive().optional(),
});

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const data = createPondSchema.parse(await request.json());
    let farm = await prisma.farm.findFirst({
      where: { ownerId: userId },
      orderBy: { createdAt: "asc" },
    });

    if (!farm) {
      return Response.json(
        { success: false, message: "Set up a farm before creating a pond." },
        { status: 409 },
      );
    }

    const pond = await prisma.pond.create({
      data: {
        farmId: farm.id,
        name: data.name,
        type: data.type,
        capacity: data.capacity,
        code: `POND-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      },
      select: { id: true, name: true, type: true, capacity: true },
    });

    return Response.json({ success: true, data: pond }, { status: 201 });
  } catch (error) {
    console.error("Create pond error:", error);
    const isValidationError = error instanceof z.ZodError;
    return Response.json(
      {
        success: false,
        message: isValidationError ? "Please enter valid pond details." : "Unable to create pond.",
      },
      { status: isValidationError ? 400 : 500 },
    );
  }
}
