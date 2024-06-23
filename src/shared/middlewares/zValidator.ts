import { ValidationTargets } from "hono";
import { validator } from "hono/validator";
import { ZodSchema } from "zod";
import { r } from "../utils";

export const zValidator = <T>(
  type: keyof ValidationTargets,
  schema: ZodSchema<T>
) =>
  validator(type, (v, c) => {
    const parsed = schema.safeParse(v);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return c.json(
        r({
          success: false,
          message: "Input validation error",
          cause: errors,
        }),
        400
      );
    }

    return parsed.data;
  });
