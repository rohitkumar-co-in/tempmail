// Server-safe HTML sanitizer without jsdom dependency

const ALLOWED_TAGS = new Set([
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
]);

const ALLOWED_ATTR = new Set([
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
]);

const FORBIDDEN_ATTR = new Set([
  "onerror",
  "onload",
  "onclick",
  "onmouseover",
  "onmouseout",
  "onmousedown",
  "onmouseup",
  "onfocus",
  "onblur",
  "onchange",
  "onsubmit",
  "onkeydown",
  "onkeyup",
  "onkeypress",
]);

/**
 * Server-safe HTML sanitizer using regex (no jsdom required)
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  let sanitized = html;

  // Remove script tags and content
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  // Remove style tags and content
  sanitized = sanitized.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ""
  );

  // Remove dangerous tags completely
  const dangerousTags = [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "button",
    "meta",
    "link",
    "base",
  ];
  for (const tag of dangerousTags) {
    const regex = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
    sanitized = sanitized.replace(regex, "");
    // Also remove self-closing versions
    sanitized = sanitized.replace(new RegExp(`<${tag}\\b[^>]*/?>`, "gi"), "");
  }

  // Remove event handlers and javascript: urls from all tags
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, "");
  sanitized = sanitized.replace(
    /href\s*=\s*["']?\s*javascript:[^"'>\s]*/gi,
    'href="#"'
  );

  // Process remaining tags - remove disallowed ones but keep content
  sanitized = sanitized.replace(
    /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
    (match, tagName) => {
      const tag = tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tag)) {
        return ""; // Remove disallowed tags
      }

      // For allowed tags, filter attributes
      if (match.startsWith("</")) {
        return `</${tag}>`; // Closing tags don't have attributes
      }

      // Extract and filter attributes
      const attrMatch = match.match(/<[a-z][a-z0-9]*\s+([^>]*)>/i);
      if (!attrMatch) {
        return match.endsWith("/>") ? `<${tag} />` : `<${tag}>`;
      }

      const attrString = attrMatch[1];
      const filteredAttrs: string[] = [];

      // Match attribute patterns
      const attrRegex =
        /([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
      let attrResult;
      while ((attrResult = attrRegex.exec(attrString)) !== null) {
        const attrName = attrResult[1].toLowerCase();
        const attrValue = attrResult[2] ?? attrResult[3] ?? attrResult[4] ?? "";

        if (ALLOWED_ATTR.has(attrName) && !FORBIDDEN_ATTR.has(attrName)) {
          // Skip javascript: URLs
          if (
            (attrName === "href" || attrName === "src") &&
            attrValue.toLowerCase().trim().startsWith("javascript:")
          ) {
            continue;
          }
          filteredAttrs.push(
            `${attrName}="${attrValue.replace(/"/g, "&quot;")}"`
          );
        }
      }

      const attrs =
        filteredAttrs.length > 0 ? " " + filteredAttrs.join(" ") : "";
      return match.endsWith("/>") ? `<${tag}${attrs} />` : `<${tag}${attrs}>`;
    }
  );

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

  // Remove HTML tags and decode entities without jsdom
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove style tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // Remove script tags
    .replace(/<[^>]+>/g, " ") // Remove all HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}
