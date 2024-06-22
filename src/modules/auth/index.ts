import { Hono } from "hono";
import { zValidator } from "../../shared/middlewares/zValidator";
import { loginSchema, refreshSchema, registerSchema } from "./schemas";
import { r } from "../../shared/utils";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "../../firebase";
import { db } from "../../shared/db";

const app = new Hono();
const auth = getAuth();

app.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, password, name } = c.req.valid("json");

  try {
    const currentUser = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const dbUser = await db.user.create({
      data: { name, firebaseId: currentUser.user.uid },
    });

    sendEmailVerification(currentUser.user).catch((e) => console.log(e));

    return c.json(
      r({
        success: true,
        message: "User created successfully, verification email sent",
        data: dbUser.id,
      })
    );
  } catch (error) {
    console.error(error);
    const e = error as Error;

    return c.json(
      r({
        message: e.message,
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

    const accessToken = await userCredential.user.getIdToken();
    const refreshToken = userCredential.user.refreshToken;

    return c.json(
      r({
        success: true,
        message: "User logged in successfully",
        data: {
          accessToken,
          refreshToken,
        },
      })
    );
  } catch (error) {
    console.error(error);
    return c.json(
      r({
        success: false,
        message: "Error happened while logging in",
      }),
      500
    );
  }
});

app.post("/refresh", zValidator("json", refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid("json");

  const URL = "https://securetoken.googleapis.com/v1/token";

  const res = await fetch(`${URL}?key=${process.env.FIREBASE_API_KEY}`, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
  });

  if (!res.ok) {
    return c.json(
      r({
        success: false,
        message: "Error happened while refreshing the token",
      }),
      500
    );
  }

  const data = await res.json();

  console.log(data);

  return c.json(
    r({
      success: true,
      message: "Renewed access token",
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      },
    })
  );
});

// app.get("/logout", authorize, async (c) => {
//   const { id } = c.get("user");

//   try {
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
