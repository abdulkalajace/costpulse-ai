import crypto from "crypto";

/** Short, URL-safe unique id (no extra dependency needed). */
export function createId(): string {
  return crypto.randomBytes(16).toString("hex");
}
