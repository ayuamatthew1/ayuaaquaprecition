import { z } from "zod";

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2),
    lastName: z.string().trim().min(2),
    email: z.string().trim().email(),
    phone: z.string().trim().min(10, "Phone number is required"),
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
    .min(3, "Email or phone number is required"),

  password: z
    .string()
    .min(8, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
