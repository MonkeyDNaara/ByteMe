"use server";

import { neon } from "@neondatabase/serverless";
import { z } from "zod";

const databaseSchema = z.string().trim().min(1, "DATABASE_URL needed");

const databaseUrl = databaseSchema.parse(process.env.DATABASE_URL);

export const sql = neon(databaseUrl);
