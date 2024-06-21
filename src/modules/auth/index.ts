import { Hono } from "hono";
import { zValidator } from "../../shared/middlewares/zValidator";
import { loginSchema, refreshSchema, registerSchema } from "./schemas";
// import { db } from "../../shared/db";
// import { randomBytes } from "crypto";
// import { sign } from "hono/jwt";
// import { JwtPayload } from "./types";
// import { authorize } from "../../shared/middlewares/authorize";
import { r } from "../../shared/utils";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "../../firebase";

const app = new Hono();
const auth = getAuth();

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const currentUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    sendEmailVerification(currentUser.user).catch((e) => console.log(e));

    return c.json(
      r({
        success: true,
        message: "User created successfully, verification email sent",
        data: currentUser.user.uid,
      })
    );
  } catch (error) {
    console.log(error);

    return c.json(
      r({
        message: error.message as string,
        success: false,
      }),
      500
    );
  }
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const idToken = await userCredential.user.getIdToken();

    return c.json(
      r({
        success: true,
        message: "User logged in successfully",
        data: {
          accessToken: idToken,
        },
      })
    );
  } catch (error) {
    console.log(error);
    return c.json(
      r({
        success: false,
        message: "Error happened while logging in",
      }),
      500
    );
  }
});

// app.post("/refresh", zValidator("json", refreshSchema), async (c) => {
//   const { refreshToken, userId } = c.req.valid("json");

//   const existingUser = await db.user.findFirst({
//     where: { id: userId },
//     select: { refreshToken: true, username: true },
//   });

//   if (!existingUser) {
//     return c.json(
//       r({
//         success: false,
//         message: "Invalid credentials",
//         cause: "DEBUG, user not found",
//       }),
//       401
//     );
//   }

//   if (!existingUser.refreshToken) {
//     return c.json(
//       r({
//         success: false,
//         message: "User is not logged in",
//       }),
//       401
//     );
//   }

//   const isValidToken = await Bun.password.verify(
//     refreshToken,
//     existingUser.refreshToken
//   );

//   if (!isValidToken) {
//     return c.json(
//       r({
//         success: false,
//         message: "Invalid refresh token",
//       }),
//       401
//     );
//   }

//   const newRefreshToken = randomBytes(64).toString("hex");
//   const hashedNewRefreshToken = await Bun.password.hash(newRefreshToken);

//   const payload: JwtPayload = { id: userId, username: existingUser.username };

//   const newAccessToken = await sign(
//     {
//       ...payload,
//       exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
//       iat: Math.floor(Date.now() / 1000),
//     },
//     process.env.JWT_SECRET
//   );

//   await db.user.update({
//     where: { id: userId },
//     data: { refreshToken: hashedNewRefreshToken },
//     select: null,
//   });

//   return c.json(
//     r({
//       success: true,
//       message: "Renewed access token",
//       data: {
//         accessToken: newAccessToken,
//         refreshToken: newRefreshToken,
//       },
//     })
//   );
// });

// app.get("/logout", authorize, async (c) => {
//   const { id } = c.get("user");

//   try {
//     await db.user.update({
//       where: { id: id, NOT: [{ refreshToken: null }] },
//       data: { refreshToken: null },
//     });

//     return c.json(
//       r({
//         success: true,
//         message: "Logged out successfully",
//       })
//     );
//   } catch (error) {
//     return c.json(
//       r({
//         success: false,
//         message: "Error happened while logging out",
//         cause: "DEBUG, user not found or already logged out probably",
//       }),
//       401
//     );
//   }
// });

export default app;
