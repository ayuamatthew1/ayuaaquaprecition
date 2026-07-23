import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { z } from "zod";

const createPondSchema = z.object({
  name: z.string().trim().min(2, "Pond name must be at least 2 characters.").max(80),
  type: z.enum(["EARTHEN", "CONCRETE", "TARPAULIN", "FIBER", "PLASTIC"]),
  capacity: z.number().positive().optional(),
});

type CreatePondInput = z.infer<typeof createPondSchema>;

type PondType = "EARTHEN" | "CONCRETE" | "TARPAULIN" | "FIBER" | "PLASTIC";

interface PondFishBatch {
  species: string | null;
  quantity: number;
}

interface PondWithFishBatch {
  id: string;
  name: string;
  type: PondType;
  capacity: number | null;
  waterVolume: number | null;
  device: { id: string, name: string } | null;
  fishBatches: PondFishBatch[];
}

interface PondResponseItem {
  id: string;
  name: string;
  type: PondType;
  capacity: number | null;
  waterVolume: number;
  species: string | null;
  fishCount: number;
  hasFish: boolean;
  hasDevice: boolean;
  device: { id: string, name: string } | null;
}

export async function GET(request: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const ponds: PondWithFishBatch[] = await prisma.pond.findMany({
    where: { farm: { ownerId: userId } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      type: true,
      capacity: true,
      waterVolume: true,
      device: { select: { id: true, name: true } },
      fishBatches: {
        orderBy: { stockedAt: "desc" },
        take: 1,
        select: { species: true, quantity: true },
      },
    },
  });

  return Response.json({
    success: true,
    data: { ponds }
    //  ponds.map((pond): PondResponseItem => ({
    //   id: pond.id,
    //   name: pond.name,
    //   type: pond.type,
    //   capacity: pond.capacity,
    //   waterVolume: pond.waterVolume ?? pond.capacity ?? 0,
    //   species: pond.fishBatches[0]?.species ?? null,
    //   fishCount: pond.fishBatches[0]?.quantity ?? 0,
    //   hasFish: (pond.fishBatches[0]?.quantity ?? 0) > 0,
    //   hasDevice: Boolean(pond.device),
    //   device: pond.device
    // })),
  });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const data: CreatePondInput = createPondSchema.parse(await request.json());
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
