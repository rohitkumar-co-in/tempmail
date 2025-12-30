"use server";

/**
 * Email Actions
 *
 * Server actions for email-related operations including:
 * - Fetching emails from Gmail
 * - Managing recent inbox history
 * - Marking emails as read/unread
 */

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth, getServerSession } from "@/lib/auth/session";
import { fetchEmails, GmailTokenError } from "@/lib/gmail";
import { inboxRequestSchema } from "@/lib/validators";
import { logger } from "@/lib/logger";
import type { Email, EmailListResult, ActionResult } from "@/lib/types";

/** Recent email entry returned to client */
export interface RecentEmail {
  address: string;
  lastUsed: string;
}

/** Maximum number of recent inboxes to store per user */
const MAX_RECENT_EMAILS = 10;

/**
 * Get recent inboxes for the current user
 * @returns Array of recent inbox addresses
 */
export async function getRecentEmailsAction(): Promise<RecentEmail[]> {
  noStore();

  try {
    const session = await getServerSession();
    if (!session?.user?.id) return [];

    const recentInboxes = await prisma.recentInbox.findMany({
      where: { userId: session.user.id },
      orderBy: { lastUsed: "desc" },
      take: MAX_RECENT_EMAILS,
    });

    return recentInboxes.map((inbox) => ({
      address: inbox.address,
      lastUsed: inbox.lastUsed.toISOString(),
    }));
  } catch (error) {
    logger.error("Failed to get recent emails", { error });
    return [];
  }
}

/**
 * Add an inbox to the user's recent list
 * Creates new entry or updates lastUsed timestamp
 * @param address - Full email address (inbox@domain)
 */
export async function addRecentEmailAction(address: string): Promise<void> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return;

    await prisma.recentInbox.upsert({
      where: {
        userId_address: {
          userId: session.user.id,
          address: address,
        },
      },
      update: {
        lastUsed: new Date(),
      },
      create: {
        userId: session.user.id,
        address: address,
        lastUsed: new Date(),
      },
    });

    logger.userAction("Inbox accessed", session.user.id, { address });

    // Clean up old entries (keep only MAX_RECENT_EMAILS)
    const allInboxes = await prisma.recentInbox.findMany({
      where: { userId: session.user.id },
      orderBy: { lastUsed: "desc" },
    });

    if (allInboxes.length > MAX_RECENT_EMAILS) {
      const toDelete = allInboxes.slice(MAX_RECENT_EMAILS);
      await prisma.recentInbox.deleteMany({
        where: {
          id: { in: toDelete.map((i) => i.id) },
        },
      });
    }
  } catch (error) {
    logger.error("Failed to save recent email", { error, address });
  }
}

/**
 * Remove a single inbox from the user's recent list
 * @param address - Full email address to remove
 */
export async function removeRecentEmailAction(
  address: string
): Promise<ActionResult> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.recentInbox.delete({
      where: {
        userId_address: {
          userId: session.user.id,
          address: address,
        },
      },
    });

    logger.userAction("Inbox removed from recents", session.user.id, {
      address,
    });
    return { success: true };
  } catch (error) {
    logger.error("Failed to remove recent email", { error, address });
    return { success: false, error: "Failed to remove inbox" };
  }
}

/**
 * Clear all recent inboxes for the current user
 */
export async function clearRecentEmailsAction(): Promise<ActionResult> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    await prisma.recentInbox.deleteMany({
      where: { userId: session.user.id },
    });

    logger.userAction("All recent inboxes cleared", session.user.id);
    return { success: true };
  } catch (error) {
    logger.error("Failed to clear recent emails", { error });
    return { success: false, error: "Failed to clear inboxes" };
  }
}

/**
 * Fetch emails for a specific inbox
 * Retrieves from Gmail API and caches in database
 *
 * @param inbox - Inbox name (before @)
 * @param domain - Domain name (after @)
 * @returns Result with email list or error
 */
export async function getEmailsAction(
  inbox: string,
  domain: string
): Promise<ActionResult<EmailListResult>> {
  noStore();

  try {
    await requireAuth();

    // Validate input
    const validation = inboxRequestSchema.safeParse({ inbox, domain });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.issues[0]?.message || "Invalid input",
      };
    }

    const fullAddress = `${inbox.toLowerCase()}@${domain.toLowerCase()}`;

    // Fetch emails from Gmail
    const gmailEmails = await fetchEmails({
      inboxName: inbox,
      domain,
      maxResults: 100,
    });

    logger.info("Emails fetched", {
      address: fullAddress,
      count: gmailEmails.length,
    });

    // Cache emails in database (upsert to avoid duplicates)
    if (gmailEmails.length > 0) {
      await Promise.all(
        gmailEmails.map((email) =>
          prisma.cachedEmail.upsert({
            where: { id: email.id },
            update: {
              fromAddress: email.from,
              toAddress: email.to,
              subject: email.subject,
              body: email.body,
              isHtml: email.isHtml,
              receivedAt: new Date(email.receivedAt),
            },
            create: {
              id: email.id,
              inboxAddress: fullAddress,
              fromAddress: email.from,
              toAddress: email.to,
              subject: email.subject,
              body: email.body,
              isHtml: email.isHtml,
              isRead: false,
              receivedAt: new Date(email.receivedAt),
            },
          })
        )
      );
    }

    // Get read status from database
    const cachedEmails = await prisma.cachedEmail.findMany({
      where: { inboxAddress: fullAddress },
      select: { id: true, isRead: true },
    });

    const readStatusMap = new Map(cachedEmails.map((e) => [e.id, e.isRead]));

    // Merge read status with fetched emails
    const emailsWithReadStatus: Email[] = gmailEmails.map((email) => ({
      ...email,
      isRead: readStatusMap.get(email.id) ?? false,
    }));

    return {
      success: true,
      data: {
        emails: emailsWithReadStatus,
        totalCount: emailsWithReadStatus.length,
        hasMore: false,
      },
    };
  } catch (error) {
    // Handle Gmail token errors - needs setup/reconfiguration
    if (error instanceof GmailTokenError) {
      logger.warn("Gmail token error", { error: error.message });
      return {
        success: false,
        error: error.message,
        needsGmailSetup: true,
      };
    }

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return { success: false, error: "Please sign in to view emails" };
      }
    }

    logger.error("getEmailsAction error", { error });
    return { success: false, error: "Failed to fetch emails" };
  }
}

/**
 * Mark an email as read
 * @param emailId - Gmail message ID
 */
export async function markEmailAsReadAction(
  emailId: string
): Promise<ActionResult> {
  try {
    await requireAuth();

    await prisma.cachedEmail.update({
      where: { id: emailId },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    logger.error("Failed to mark email as read", { error, emailId });
    return { success: false, error: "Failed to mark as read" };
  }
}

/**
 * Mark an email as unread
 * @param emailId - Gmail message ID
 */
export async function markEmailAsUnreadAction(
  emailId: string
): Promise<ActionResult> {
  try {
    await requireAuth();

    await prisma.cachedEmail.update({
      where: { id: emailId },
      data: { isRead: false },
    });

    return { success: true };
  } catch (error) {
    logger.error("Failed to mark email as unread", { error, emailId });
    return { success: false, error: "Failed to mark as unread" };
  }
}
