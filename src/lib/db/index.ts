import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? null;

export function hasDatabase(): boolean {
  return connectionString !== null;
}

let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  return drizzle(neon(connectionString!), { schema });
}

export function getDb() {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}