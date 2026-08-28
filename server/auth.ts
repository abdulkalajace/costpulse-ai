import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "";
const COOKIE_NAME = "cp_session";
const TOKEN_TTL = "30d";

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  // Fail loudly rather than silently signing tokens with an empty secret.
  throw new Error(
    "JWT_SECRET is not set. Set it in your environment before starting the server in production."
  );
}
const EFFECTIVE_SECRET = JWT_SECRET || "dev-only-insecure-secret-change-me";

export interface SessionPayload {
  userId: string;
  accountId: string;
  email: string;
  role: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, EFFECTIVE_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

const isProd = process.env.NODE_ENV === "production";

export function setSessionCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

declare global {
  namespace Express {
    interface Request {
      session?: SessionPayload;
    }
  }
}

/** Attaches req.session if a valid cookie is present. Never blocks the request. */
export function attachSession(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    const payload = verifySession(token);
    if (payload) req.session = payload;
  }
  next();
}

/** Blocks the request with 401 unless a valid session is present. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }
  next();
}

const ADMIN_ROLES = new Set(["MASTER", "MD_CEO", "CFO"]);

/** Blocks the request with 403 unless the session role has admin privileges. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session || !ADMIN_ROLES.has(req.session.role)) {
    return res.status(403).json({ success: false, error: "Admin privileges required" });
  }
  next();
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
