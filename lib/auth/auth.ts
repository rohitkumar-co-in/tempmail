import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: false, // Disabled - using Google OAuth only
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Request Gmail readonly scope to access emails
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly",
      ],
      // Get refresh token for Gmail API access
      accessType: "offline",
      prompt: "consent",
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
