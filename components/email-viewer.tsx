"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Mail, Calendar, User, AtSign } from "lucide-react";
import type { Email } from "@/lib/types";

interface EmailViewerProps {
  email: Email | null;
}

// Strip HTML tags and decode HTML entities
function stripHtml(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, " ");

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/gi, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([a-fA-F0-9]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );

  // Clean up whitespace
  text = text
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  return text;
}

// Extract sender name from email
function extractSenderName(from: string): string {
  const match = from.match(/^([^<]+)</);
  if (match) return match[1].trim();
  return from.split("@")[0];
}

// Extract sender email
function extractSenderEmail(from: string): string {
  const match = from.match(/<([^>]+)>/);
  if (match) return match[1];
  return from;
}

export function EmailViewer({ email }: EmailViewerProps) {
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (!email) {
    return (
      <div className="hidden md:flex flex-1 items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-linear-to-r from-indigo-500/10 to-purple-600/10 flex items-center justify-center">
            <Mail className="h-10 w-10 text-indigo-500/50" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground">
            Select an email to view
          </h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Choose an email from the list to see its contents
          </p>
        </div>
      </div>
    );
  }

  const senderName = extractSenderName(email.from);
  const senderEmail = extractSenderEmail(email.from);
  const plainTextBody = email.isHtml
    ? stripHtml(email.body)
    : email.body.replace(/<br\s*\/?>/gi, "\n");

  return (
    <div className="flex-1 flex flex-col bg-linear-to-b from-muted/30 to-background">
      {/* Email Header */}
      <div className="p-4 md:p-6 bg-background border-b">
        {/* Subject */}
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-foreground">
          {email.subject}
        </h1>

        {/* Sender Info Card */}
        <Card className="p-3 md:p-4 bg-linear-to-r from-indigo-500/5 to-purple-600/5 border-indigo-500/20">
          <div className="flex items-start gap-3 md:gap-4">
            {/* Avatar */}
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-base md:text-lg">
                {senderName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-indigo-500" />
                <span className="font-semibold text-foreground text-sm md:text-base">
                  {senderName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
                <AtSign className="h-3 w-3" />
                <span className="truncate">{senderEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(email.receivedAt)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Email Body */}
      <ScrollArea className="flex-1">
        <div className="p-4 md:p-6">
          <Card className="p-4 md:p-6 shadow-sm">
            <div className="text-sm leading-7 text-foreground whitespace-pre-wrap break-words">
              {plainTextBody}
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
