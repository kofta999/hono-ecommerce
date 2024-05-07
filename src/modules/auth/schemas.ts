import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, "Username should have only letters and numbers")
    .min(5, "Username should have more than 5 characters"),
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
  profilePictureUrl: z.string().optional(),
  bio: z.string().optional(),
});

export const loginSchema = registerSchema.pick({ email: true, password: true });
