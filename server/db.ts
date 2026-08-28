import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";
import * as schema from "./schema";

// Module import order in server.ts means this file can be evaluated before
// server.ts's own dotenv.config() call runs, so we load the .env file here
// too (dotenv.config() is idempotent/safe to call more than once).
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and point it at your Postgres instance."
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Most managed Postgres providers (Railway, Render, Supabase, Neon) require
  // SSL in production but use a self-signed cert chain, so we disable strict
  // verification rather than rejecting the connection outright.
  ssl:
    process.env.NODE_ENV === "production" && !process.env.DATABASE_URL.includes("localhost")
      ? { rejectUnauthorized: false }
      : undefined,
});

export const db = drizzle(pool, { schema });
