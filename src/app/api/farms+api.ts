import { getAuthenticatedUserId } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { z } from "zod";

const createFarmSchema = z.object({
  name: z.string().trim().min(2, "Farm name must be at least 2 characters.").max(100),
  description: z.string().trim().max(500).optional(),
  address: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
});

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });

  const farms = await prisma.farm.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, city: true, state: true, country: true, status: true },
  });

  return Response.json({ success: true, data: farms });
}

export async function POST(request: Request) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return Response.json({ success: false, message: "Unauthorized." }, { status: 401 });

    const data = createFarmSchema.parse(await request.json());
    const farm = await prisma.farm.create({
      data: {
        ownerId: userId,
        name: data.name,
        description: data.description || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
      },
      select: { id: true, name: true, city: true, state: true, country: true, status: true },
    });

    return Response.json({ success: true, data: farm }, { status: 201 });
    
  } catch (error) {
    const isValidationError = error instanceof z.ZodError;
    return Response.json(
      { success: false, message: isValidationError ? "Please enter valid farm details." : "Unable to create farm." },
      { status: isValidationError ? 400 : 500 },
    );
  }
}
