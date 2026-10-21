import { createMiddleware } from "@tanstack/react-start";
import { readSession } from "./firebase-session";
export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const session = readSession();
  return next({ headers: session ? { Authorization: `Bearer ${session.idToken}` } : {} });
});