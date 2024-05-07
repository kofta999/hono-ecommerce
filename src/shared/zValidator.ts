import { ValidationTargets } from "hono";
import { validator } from "hono/validator";
import { ZodSchema } from "zod";
import { Response } from "./types/Response";

export const zValidator = <T>(
  type: keyof ValidationTargets,
  schema: ZodSchema<T>
) =>
  validator(type, (v, c) => {
    const parsed = schema.safeParse(v);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return c.json<Response, 400>({
        success: false,
        message: "Input validation error",
        cause: errors,
      });
    }

    return parsed.data;
  });
