import { FirebaseError } from "firebase/app";
import { ErrorHandler } from "hono";
import { StatusCode } from "hono/utils/http-status";

// Improve error handler
export const errorHandler: ErrorHandler = (err, c) => {
  console.error(err.message, err.cause);

  if (err instanceof FirebaseError) {
    const { message, code } = firebaseErrorHandler(err)
    return c.json({
      success: false,
      message,
    }, code)
  }

  return c.json(
    {
      success: false,
      message: "Internal Server Error",
    },
    500
  );
};

const firebaseErrorHandler = (err: FirebaseError): { message: string, code: StatusCode } => {
  switch (err.code) {
    case 'auth/email-already-in-use':
      return { message: 'Email address is already in use, log in instead', code: 409 }

    case 'auth/invalid-credential':
      return { message: 'Invalid Credentials', code: 401 }

    default:
      return { message: 'Internal Server Error', code: 500 }
  }
}
