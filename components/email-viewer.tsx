"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Mail, Calendar, User, AtSign } from "lucide-react";
import type { Email } from "@/lib/types";
import { sanitizeHtml } from "@/lib/sanitizer";

interface EmailViewerProps {
  email: Email | null;
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
      <div className="flex flex-1 items-center justify-center bg-muted/20 p-4">
        <div className="text-center">
          <div className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 rounded-full bg-linear-to-r from-indigo-500/10 to-purple-600/10 flex items-center justify-center">
            <Mail className="h-8 w-8 md:h-10 md:w-10 text-indigo-500/50" />
          </div>
          <h3 className="text-base md:text-lg font-medium text-muted-foreground">
            Select an email to view
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground/70 mt-1">
            Choose an email from the list to see its contents
          </p>
        </div>
      </div>
    );
  }

  const senderName = extractSenderName(email.from);
  const senderEmail = extractSenderEmail(email.from);
  const emailBody = email.isHtml
    ? sanitizeHtml(email.body)
    : email.body.replace(/\n/g, "<br />");

  return (
    <div className="flex-1 flex flex-col bg-linear-to-b from-muted/30 to-background min-w-0 overflow-hidden">
      {/* Email Header */}
      <div className="p-4 md:p-6 bg-background border-b overflow-hidden shrink-0">
        {/* Subject */}
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-foreground wrap-break-words">
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
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="p-4 md:p-6">
            <div
              className="text-sm leading-7 text-foreground wrap-break-words [&_img]:max-w-full [&_img]:h-auto [&_table]:max-w-full [&_pre]:overflow-x-auto [&_pre]:max-w-full"
              dangerouslySetInnerHTML={{ __html: emailBody }}
            />
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
    </div>
  );
}
