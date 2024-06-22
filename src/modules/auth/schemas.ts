import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z ]+$/, "Name should have only letters and spaces")
    .min(5, "Name should have 5 characters or more"),
  email: z
    .string()
    .email(`Email should be a valid email, for example "example@example.com"`),
  password: z
    .string()
    .min(6, "Password should have more than 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{6,}$/,
      "Password should have at least a lowercase letter and a number"
    ),
});

export const loginSchema = registerSchema.pick({ email: true, password: true });

export const refreshSchema = z.object({
  // userId: z.number(),
  refreshToken: z.string(),
});
