import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";

export type Env = {
  Variables: {
    user: DecodedIdToken;
  };
};
