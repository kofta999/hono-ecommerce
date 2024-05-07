import { Hono } from "hono";
import { zValidator } from "../../shared/zValidator";
import { registerSchema } from "./schemas";
import { db } from "../../shared/db";
import { Response } from "../../shared/types/Response";

const app = new Hono();

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const parsedUser = c.req.valid("json");

  const isUserExists =
    (await db.user.count({
      where: {
        OR: [{ email: parsedUser.email }, { username: parsedUser.username }],
      },
    })) > 0;

  if (isUserExists) {
    return c.json<Response, 409>({
      success: false,
      message: "User already exists, please log in instead",
    });
  }

  const hashedPassword = await Bun.password.hash(parsedUser.password);

  const userId = await db.user.create({
    data: { ...parsedUser, password: hashedPassword },
    select: { id: true },
  });

  return c.json<Response, 200>({
    success: true,
    message: "User created successfully",
    data: { userId },
  });
});

export default app;
