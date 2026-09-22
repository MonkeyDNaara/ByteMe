import { createNeonAuth } from "@neondatabase/auth/next/server";
import { z } from "zod";

const authEnvSchema = z.object({
  NEON_AUTH_BASE_URL: z.string().trim().url("NEON_AUTH_BASE_URL needed"),
  NEON_AUTH_COOKIE_SECRET: z
    .string()
    .min(32, "NEON_AUTH_COOKIE_SECRET needed (at least 32 characters)"),
});

const env = authEnvSchema.parse(process.env);

export const auth = createNeonAuth({
  baseUrl: env.NEON_AUTH_BASE_URL,
  cookies: { secret: env.NEON_AUTH_COOKIE_SECRET },
});
