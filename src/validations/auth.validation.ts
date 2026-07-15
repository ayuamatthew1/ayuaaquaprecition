import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),

    username: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_]+$/),

    email: z.string().trim().email(),
    phone: z.string().trim().min(7, "Phone number is required"),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Email or username is required"),

  password: z
    .string()
    .min(8, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
