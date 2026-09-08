import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL fehlt in der .env.local Datei!");
}

export const sql = neon(process.env.DATABASE_URL);
