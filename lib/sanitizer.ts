import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a window object for server-side DOMPurify
const { window } = new JSDOM("");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const purify = DOMPurify(window as any);

// Strict sanitization config for email HTML
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "div",
    "span",
    "a",
    "strong",
    "b",
    "i",
    "em",
    "u",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "table",
    "thead",
    "tbody",
    "tr",
    "td",
    "th",
    "img",
    "blockquote",
    "pre",
    "code",
    "hr",
  ],
  ALLOWED_ATTR: [
    "href",
    "src",
    "alt",
    "title",
    "class",
    "style",
    "width",
    "height",
    "target",
    "rel",
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["target", "rel"],
  FORBID_TAGS: [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "button",
  ],
  FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
};

/**
 * Sanitize HTML content from emails to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // First pass: sanitize with DOMPurify
  let sanitized = purify.sanitize(html, SANITIZE_CONFIG) as string;

  // Force all links to open in new tab with security attributes
  sanitized = sanitized.replace(
    /<a\s+([^>]*href=)/gi,
    '<a target="_blank" rel="noopener noreferrer" $1'
  );

  return sanitized;
}

/**
 * Sanitize plain text content (escape HTML entities)
 */
export function sanitizePlainText(text: string): string {
  if (!text) return "";

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\n/g, "<br />");
}

/**
 * Extract plain text from HTML content
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";

  const { window } = new JSDOM(html);
  return window.document.body.textContent || "";
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}
