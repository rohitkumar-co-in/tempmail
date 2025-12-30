/**
 * Canonical Data Models
 *
 * Shared type definitions used throughout the application.
 * These types ensure consistency between client and server code.
 */

/** User model from database */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Email message structure */
export interface Email {
  /** Unique Gmail message ID */
  id: string;
  /** Sender email address with optional name */
  from: string;
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** ISO timestamp when email was received */
  receivedAt: string;
  /** Email body content (sanitized) */
  body: string;
  /** Whether body is HTML or plain text */
  isHtml: boolean;
  /** Read status (from cache) */
  isRead?: boolean;
}

/** Context for current inbox view */
export interface InboxContext {
  /** Inbox name (before @) */
  name: string;
  /** Domain (after @) */
  domain: string;
  /** Full email address */
  fullAddress: string;
}

/** Result from email list fetch */
export interface EmailListResult {
  /** Array of emails */
  emails: Email[];
  /** Total count of emails */
  totalCount: number;
  /** Whether more emails are available */
  hasMore: boolean;
}

/**
 * Generic result type for server actions
 * @template T - Type of data on success
 */
export interface ActionResult<T = void> {
  /** Whether the action succeeded */
  success: boolean;
  /** Data returned on success */
  data?: T;
  /** Error message on failure */
  error?: string;
  /** Flag indicating Gmail needs to be configured */
  needsGmailSetup?: boolean;
}
