import { prisma } from "@/src/lib/db.server";
import { hashPassword } from "@/src/lib/password";
import { registerSchema } from "@/src/validations/auth.validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
          { phone: data.phone },
        ]
      }
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "User already exists."
        },
        {
          status: 409
        }
      );
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        phone: data.phone,
        passwordHash
      }
    });

    return Response.json(
      {
        success: true,
        message: "Account created successfully.",
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.name === "ZodError") {
      return Response.json(
        {
          success: false,
          errors: error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: false,
        message: error.message ?? "Internal server error.",
      },
      {
        status: 500,
      }
    );
  }
}
