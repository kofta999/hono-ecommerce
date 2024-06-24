import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "../../firebase";
import { db } from "../../shared/db";
import { OpenAPIHono } from "@hono/zod-openapi";
import { loginRoute, refreshRoute, registerRoute } from "./doc";
import { FirebaseError } from "firebase/app";

const app = new OpenAPIHono();
const auth = getAuth();

// TODO: Handle FireBase Errors
app.openapi(registerRoute, async (c) => {
  const { email, password, name } = c.req.valid("json");

  const currentUser = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const dbUser = await db.user.create({
    data: { name, firebaseId: currentUser.user.uid },
  });

  sendEmailVerification(currentUser.user).catch((e) => console.log(e));

  // TODO: should I return also tokens as firebase already signs the user in?
  return c.json(
    {
      success: true,
      message: "User created successfully, verification email sent",
      data: {
        userId: dbUser.id,
      },
    },
    200
  );
});

app.openapi(loginRoute, async (c) => {
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
      {
        success: true,
        message: "User logged in successfully",
        data: {
          accessToken,
          refreshToken,
        },
      },
      200
    );
  } catch (error) {
    const e = error as FirebaseError;
    switch (e.code) {
      case "auth/invalid-credential":
        return c.json(
          {
            success: false,
            message: "Invalid credentials",
          },
          401
        );

      default:
        throw error;
    }
  }
});

app.openapi(refreshRoute, async (c) => {
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
    throw new Error("Error happened while refreshing token");
  }

  const data = await res.json();

  return c.json(
    {
      success: true,
      message: "Renewed access token",
      data: {
        accessToken: data.access_token as string,
        refreshToken: data.refresh_token as string,
      },
    },
    200
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
