import { z } from "zod";

const envSchema = z.object({
  // Auth
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1).optional(),

  // Gmail API
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GMAIL_REFRESH_TOKEN: z.string().min(1).optional(),

  // App
  ALLOWED_DOMAINS: z.string().min(1).default("example.com"),
  GMAIL_LABEL: z.string().default("Temp"),
});

function getEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    // Don't throw during build, just return defaults
    return {
      ALLOWED_DOMAINS: "example.com",
      EMAIL_EXPIRY_HOURS: 24,
      GMAIL_LABEL: "Temp",
    } as z.infer<typeof envSchema>;
  }

  return parsed.data;
}

export const env = getEnv();

export const allowedDomains = (env.ALLOWED_DOMAINS || "example.com")
  .split(",")
  .map((d) => d.trim().toLowerCase());
