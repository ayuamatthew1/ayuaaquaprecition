import { signAccessToken, toAuthUser } from "@/src/lib/auth.server";
import { prisma } from "@/src/lib/db.server";
import { verifyPassword } from "@/src/lib/password";
import { loginSchema } from "@/src/validations/auth.validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.identifier },
          { phone: data.identifier },
        ],
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return Response.json({ success: false, message: "Invalid email or phone number or password." }, { status: 401 });
    }
    
    if (!user || user.status !== "ACTIVE") {
      return Response.json({ success: false, message: "Invalid email or phone number or password." }, { status: 401 });
    }

    const isMatch = await verifyPassword(data.password, user.passwordHash);

    if (!isMatch) {
      return Response.json({ success: false, message: "Invalid email or phone number or password." }, { status: 401 });
    }

    const accessToken = await signAccessToken(user);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return Response.json(
      {
        success: true,
        message: "Login successful.",
        data: { user: toAuthUser(user), accessToken },
      },
      {
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Login error:", error);

    const status = error.name === "ZodError" ? 400 : 500;
    return Response.json({ success: false, message: status === 400 ? "Invalid login details." : "Unable to sign in." }, { status });
  }
}
