import { z } from "zod";
import { allowedDomains } from "./env";

// Inbox name validation: alphanumeric + hyphen only
const inboxNameRegex = /^[a-z0-9]([a-z0-9+.-]*[a-z0-9])?$/i;

export const inboxNameSchema = z
  .string()
  .min(1, "Inbox name is required")
  .max(64, "Inbox name too long")
  .regex(inboxNameRegex, "Only alphanumeric characters and hyphens allowed");

export const domainSchema = z
  .string()
  .min(1, "Domain is required")
  .refine(
    (domain) => allowedDomains.includes(domain.toLowerCase()),
    "Domain not allowed"
  );

export const emailAddressSchema = z.string().email("Invalid email address");

export const loginSchema = z.object({
  email: emailAddressSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailAddressSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const inboxRequestSchema = z.object({
  inbox: inboxNameSchema,
  domain: domainSchema,
});

export function validateInboxAddress(
  address: string
): { name: string; domain: string } | null {
  const parts = address.toLowerCase().split("@");
  if (parts.length !== 2) return null;

  const [name, domain] = parts;

  const nameResult = inboxNameSchema.safeParse(name);
  const domainResult = domainSchema.safeParse(domain);

  if (!nameResult.success || !domainResult.success) return null;

  return { name, domain };
}

export function normalizeInboxName(name: string): string {
  return name.toLowerCase().trim();
}

export function buildEmailAddress(name: string, domain: string): string {
  return `${normalizeInboxName(name)}@${domain.toLowerCase()}`;
}
