import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { z } from "zod";

const createFishBatchSchema = z.object({
  pondId: z.string().min(5, "PondId is required"),
  species: z.string().trim().min(2, "Species is required.").max(80),
  quantity: z.number().int().positive("Quantity must be a positive whole number."),
  breed: z.string().trim().max(80).optional(),
  averageWeight: z.number().positive().optional(),
  source: z.string().trim().max(80).optional(),
});

function getPondIdFromRequest(request: Request) {
  const match = request.url.match(/\/api\/ponds\/([^/]+)\/fish-batches/);
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

    const data = createFishBatchSchema.parse(await request.json());

    const pond = await prisma.pond.findFirst({
      where: { id: pondId, farm: { ownerId: userId } },
      select: { id: true },
    });

    if (!pond) {
      return Response.json({ success: false, message: "Pond not found." }, { status: 404 });
    }

    const fishBatch = await prisma.fishBatch.create({
      data: {
        pondId: pond.id,
        species: data.species,
        breed: data.breed ?? null,
        quantity: data.quantity,
        averageWeight: data.averageWeight ?? null,
        source: data.source ?? null,
        stockedAt: new Date(),
        expectedHarvestDate: new Date(new Date().setMonth(new Date().getMonth() + 6))
      },
      select: {
        id: true,
        species: true,
        quantity: true,
        stockedAt: true,
      },
    });

    return Response.json({ success: true, data: fishBatch }, { status: 201 });
  } catch (error) {
    console.error("Create fish batch error:", error);

    if (error instanceof z.ZodError) {
      return Response.json({ success: false, message: "Please provide valid fish batch details." }, { status: 400 });
    }

    return Response.json({ success: false, message: "Unable to create fish batch." }, { status: 500 });
  }
}
