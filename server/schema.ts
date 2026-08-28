import { pgTable, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createId } from "./id";

// Multi-tenant model: each signed-up organization is an `accounts` row (a
// tenant). Each account can have multiple human `users` logins (role-based).
// The full operational ledger (expenses, subscriptions, assets, vendors,
// budgets, departments, etc.) is stored as a single JSON "workspace" document
// on the account. This mirrors the shape the frontend already works with
// (EnterpriseAppData), so the 30+ existing React views didn't need to be
// rewritten one-by-one to migrate off localStorage — they now read/write
// through a real authenticated API backed by Postgres instead.
//
// Normalizing expenses/subscriptions/assets/etc into their own relational
// tables (for server-side filtering, indexing, and reporting at scale) is the
// natural next evolution once the product has real usage patterns to design
// around — see README "Data model roadmap".

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  // One of the canonical INDUSTRIES categories from src/types.ts (or a
  // free-text custom label when the user picked "Other" at signup). Kept as
  // a real column, not just inside `workspace`, so it can be queried across
  // accounts for benchmarking/analytics without parsing JSON.
  industry: text("industry").notNull().default(""),
  currency: text("currency").notNull().default("INR"),
  workspace: jsonb("workspace").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    departmentId: text("department_id"),
    departmentName: text("department_name"),
    avatar: text("avatar"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastLoginAt: timestamp("last_login_at"),
  },
  (table) => ({
    accountIdx: index("users_account_id_idx").on(table.accountId),
  })
);
