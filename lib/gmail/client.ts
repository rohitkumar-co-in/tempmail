/**
 * Gmail API Client
 *
 * Handles all Gmail API interactions for the catch-all email system.
 * Uses OAuth2 refresh tokens stored in database for authentication.
 */

import { google } from "googleapis";
import type { Email } from "@/lib/types";
import { sanitizeHtml, sanitizePlainText } from "@/lib/sanitizer";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Custom error class for Gmail token-related issues
 * Used to trigger re-authentication flow in the UI
 */
export class GmailTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GmailTokenError";
  }
}

/**
 * Retrieve the refresh token from database
 * @throws {GmailTokenError} If token is missing or invalid
 */
async function getRefreshToken(): Promise<string> {
  const config = await prisma.gmailConfig.findUnique({
    where: { id: "gmail_config" },
  });

  if (!config || !config.refreshToken) {
    logger.warn("Gmail not configured - no refresh token found");
    throw new GmailTokenError(
      "Gmail not configured. Please set up Gmail integration."
    );
  }

  if (!config.isValid) {
    logger.warn("Gmail token marked as invalid");
    throw new GmailTokenError("Gmail token expired. Please re-authenticate.");
  }

  return config.refreshToken;
}

/**
 * Mark the stored Gmail token as invalid
 * Called when API requests fail due to authentication errors
 */
export async function invalidateGmailToken(): Promise<void> {
  logger.gmail("Invalidating Gmail token");
  await prisma.gmailConfig
    .update({
      where: { id: "gmail_config" },
      data: { isValid: false },
    })
    .catch(() => {
      // Ignore if config doesn't exist
    });
}

/**
 * Save or update Gmail configuration in database
 * @param refreshToken - OAuth2 refresh token
 * @param email - Optional email address for reference
 */
export async function saveGmailConfig(
  refreshToken: string,
  email?: string
): Promise<void> {
  await prisma.gmailConfig.upsert({
    where: { id: "gmail_config" },
    update: {
      refreshToken,
      email,
      isValid: true,
    },
    create: {
      id: "gmail_config",
      refreshToken,
      email,
      isValid: true,
    },
  });
  logger.gmail("Gmail configuration saved", { email: email || "unknown" });
}

/**
 * Check if Gmail is properly configured with a valid token
 */
export async function isGmailConfigured(): Promise<boolean> {
  const config = await prisma.gmailConfig.findUnique({
    where: { id: "gmail_config" },
  });
  return !!config?.refreshToken && config.isValid;
}

/**
 * Initialize OAuth2 client with refresh token from database
 * @returns Authenticated Gmail API client instance
 */
async function getGmailClient() {
  const refreshToken = await getRefreshToken();

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

/**
 * Get the Gmail label ID for filtering emails
 * @param gmail - Gmail API client
 * @returns Label ID or null if not found
 */
async function getLabelId(
  gmail: ReturnType<typeof google.gmail>
): Promise<string | null> {
  const labelName = process.env.GMAIL_LABEL;
  if (!labelName) return null;

  try {
    const response = await gmail.users.labels.list({ userId: "me" });
    const labels = response.data.labels || [];
    const label = labels.find(
      (l) => l.name?.toLowerCase() === labelName.toLowerCase()
    );
    return label?.id || null;
  } catch {
    return null;
  }
}

/** Email header type from Gmail API */
type EmailHeader = { name?: string | null; value?: string | null };

/**
 * Extract a specific header value from email headers
 * @param headers - Array of email headers
 * @param name - Header name to find (case-insensitive)
 */
function getHeader(headers: EmailHeader[], name: string): string {
  const header = headers.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase()
  );
  return header?.value || "";
}

/**
 * Decode base64url encoded content (used by Gmail API)
 * @param data - Base64url encoded string
 */
function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return Buffer.from(base64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

/** Gmail message part structure */
interface MessagePart {
  mimeType?: string | null;
  body?: { data?: string | null } | null;
  parts?: MessagePart[] | null;
}

/**
 * Extract email body from Gmail message payload
 * Handles multipart messages, preferring HTML over plain text
 * @param payload - Gmail message payload
 */
function extractBody(payload: MessagePart): { body: string; isHtml: boolean } {
  // Direct body
  if (payload.body?.data) {
    const mimeType = payload.mimeType || "text/plain";
    const isHtml = mimeType.includes("html");
    const body = decodeBase64Url(payload.body.data);
    return {
      body: isHtml ? sanitizeHtml(body) : sanitizePlainText(body),
      isHtml,
    };
  }

  // Multipart message
  if (payload.parts) {
    // Prefer HTML over plain text
    const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");
    if (htmlPart?.body?.data) {
      return {
        body: sanitizeHtml(decodeBase64Url(htmlPart.body.data)),
        isHtml: true,
      };
    }

    const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
    if (textPart?.body?.data) {
      return {
        body: sanitizePlainText(decodeBase64Url(textPart.body.data)),
        isHtml: false,
      };
    }

    // Nested multipart
    for (const part of payload.parts) {
      if (part.parts) {
        const nested = extractBody(part);
        if (nested.body) return nested;
      }
    }
  }

  return { body: "", isHtml: false };
}

/**
 * Check if email matches the target inbox address
 * Checks multiple headers to handle different email routing scenarios
 */
function matchesInbox(headers: EmailHeader[], targetEmail: string): boolean {
  const normalizedTarget = targetEmail.toLowerCase();

  // Check multiple headers that could contain the recipient
  const toHeaders = ["to", "delivered-to", "x-original-to", "x-forwarded-to"];

  for (const headerName of toHeaders) {
    const headerValue = getHeader(headers, headerName).toLowerCase();
    if (headerValue.includes(normalizedTarget)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if email is within the configured expiry window
 * @param receivedAt - ISO date string of when email was received
 */
function isWithinExpiryWindow(receivedAt: string): boolean {
  const expiryHours = parseInt(process.env.EMAIL_EXPIRY_HOURS || "24", 10);
  const emailDate = new Date(receivedAt);
  const expiryDate = new Date(Date.now() - expiryHours * 60 * 60 * 1000);
  return emailDate >= expiryDate;
}

/** Options for fetching emails */
export interface FetchEmailsOptions {
  /** Inbox name (before @) */
  inboxName: string;
  /** Domain (after @) */
  domain: string;
  /** Maximum emails to return (default: 100) */
  maxResults?: number;
  /** Include expired emails (default: true) */
  includeExpired?: boolean;
}

/**
 * Fetch emails for a specific inbox from Gmail
 * Filters emails from the catch-all inbox to match the target address
 *
 * @param options - Fetch options
 * @returns Array of emails matching the inbox
 */
export async function fetchEmails(
  options: FetchEmailsOptions
): Promise<Email[]> {
  const {
    inboxName,
    domain,
    maxResults = 100,
    includeExpired = true,
  } = options;
  const targetEmail = `${inboxName.toLowerCase()}@${domain.toLowerCase()}`;

  logger.debug("Fetching emails", { targetEmail, maxResults });

  const gmail = await getGmailClient();
  const labelId = await getLabelId(gmail);

  try {
    // List messages - use custom label if available, otherwise fetch from INBOX
    const listParams: {
      userId: string;
      maxResults: number;
      labelIds?: string[];
    } = {
      userId: "me",
      maxResults: maxResults * 3, // Fetch more since we filter in code
    };

    if (labelId) {
      listParams.labelIds = [labelId];
    } else {
      listParams.labelIds = ["INBOX"];
    }

    const listResponse = await gmail.users.messages.list(listParams);
    const messageIds = listResponse.data.messages || [];

    if (messageIds.length === 0) {
      return [];
    }

    // Fetch full message details in parallel
    const messagePromises = messageIds.map((msg) =>
      gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "full",
      })
    );

    const messages = await Promise.all(messagePromises);
    const emails: Email[] = [];

    for (const response of messages) {
      const message = response.data;
      if (!message.payload?.headers) continue;

      const headers = message.payload.headers;

      // Check if this email is for our target inbox
      if (!matchesInbox(headers, targetEmail)) continue;

      const receivedAt = getHeader(headers, "date") || new Date().toISOString();

      // Check expiry window only if includeExpired is false
      if (!includeExpired && !isWithinExpiryWindow(receivedAt)) continue;

      const { body, isHtml } = extractBody(message.payload);

      emails.push({
        id: message.id!,
        from: getHeader(headers, "from"),
        to: getHeader(headers, "to") || targetEmail,
        subject: getHeader(headers, "subject") || "(No Subject)",
        receivedAt,
        body,
        isHtml,
      });

      // Stop if we have enough emails
      if (emails.length >= maxResults) break;
    }

    // Sort by date, newest first
    emails.sort(
      (a, b) =>
        new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );

    return emails;
  } catch (error) {
    // Check if it's an auth error and invalidate token
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isAuthError =
      errorMessage.includes("invalid_grant") ||
      errorMessage.includes("Token has been expired") ||
      errorMessage.includes("Invalid Credentials") ||
      errorMessage.includes("missing required authentication credential") ||
      errorMessage.includes("Request had invalid authentication credentials");

    if (isAuthError) {
      logger.error("Gmail authentication error - invalidating token", {
        error: errorMessage,
      });
      await invalidateGmailToken();
      throw new GmailTokenError("Gmail token expired. Please re-authenticate.");
    }
    logger.error("Error fetching emails from Gmail", { error: errorMessage });
    throw new Error("Failed to fetch emails");
  }
}

/**
 * Get a single email by ID
 * @param emailId - Gmail message ID
 * @param targetEmail - Full email address to verify ownership
 * @param includeExpired - Whether to include expired emails
 */
export async function getEmailById(
  emailId: string,
  targetEmail: string,
  includeExpired: boolean = true
): Promise<Email | null> {
  const gmail = await getGmailClient();

  try {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: emailId,
      format: "full",
    });

    const message = response.data;
    if (!message.payload?.headers) return null;

    const headers = message.payload.headers;

    // Verify this email belongs to the requested inbox
    if (!matchesInbox(headers, targetEmail)) return null;

    const receivedAt = getHeader(headers, "date") || new Date().toISOString();

    // Check expiry only if includeExpired is false
    if (!includeExpired && !isWithinExpiryWindow(receivedAt)) return null;

    const { body, isHtml } = extractBody(message.payload);

    return {
      id: message.id!,
      from: getHeader(headers, "from"),
      to: getHeader(headers, "to") || targetEmail,
      subject: getHeader(headers, "subject") || "(No Subject)",
      receivedAt,
      body,
      isHtml,
    };
  } catch (error) {
    logger.error("Error fetching email by ID", { emailId, error });
    return null;
  }
}

/**
 * Get count of emails for an inbox
 * @param inboxName - Inbox name (before @)
 * @param domain - Domain (after @)
 * @param includeExpired - Whether to include expired emails
 */
export async function getEmailCount(
  inboxName: string,
  domain: string,
  includeExpired: boolean = true
): Promise<number> {
  const emails = await fetchEmails({
    inboxName,
    domain,
    maxResults: 100,
    includeExpired,
  });
  return emails.length;
}
