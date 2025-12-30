"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Mail, ArrowLeft, RefreshCw, Copy, Circle } from "lucide-react";
import { toast } from "sonner";
import type { Email } from "@/lib/types";

interface EmailSidebarProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  fullAddress: string;
  onRefresh: () => void;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function extractSenderName(from: string) {
  const match = from.match(/^([^<]+)</);
  if (match) return match[1].trim();
  return from.split("@")[0];
}

// Header content component
function SidebarHeader({
  fullAddress,
  onRefresh,
  isRefreshing,
}: {
  fullAddress: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(fullAddress);
      toast.success("Email address copied!");
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <div className="p-4 border-b bg-background">
      <div className="flex items-center gap-2 mb-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-sm">
            {fullAddress.split("@")[0]}
          </p>
          <p className="text-xs text-muted-foreground">
            @{fullAddress.split("@")[1]}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={copyToClipboard}
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("h-3 w-3 mr-1", isRefreshing && "animate-spin")}
          />
          {isRefreshing ? "Refreshing" : "Refresh"}
        </Button>
      </div>
    </div>
  );
}

// Email list content component
function EmailList({
  emails,
  selectedEmailId,
  onSelectEmail,
  isLoading,
  onItemClick,
}: {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
  isLoading: boolean;
  onItemClick?: () => void;
}) {
  return (
    <>
      {/* Email count */}
      <div className="px-4 py-2 border-b">
        <p className="text-xs text-muted-foreground">
          {emails.length} email{emails.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Email list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg border bg-background">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No emails yet</p>
              <p className="text-xs mt-1">
                Emails sent to this address will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {emails.map((email) => {
                const isSelected = selectedEmailId === email.id;
                const isUnread = !email.isRead;
                return (
                  <button
                    key={email.id}
                    onClick={() => {
                      onSelectEmail(email);
                      onItemClick?.();
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all",
                      isSelected
                        ? "bg-linear-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/30"
                        : "hover:bg-accent border border-transparent",
                      isUnread && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isUnread && (
                          <Circle className="h-2 w-2 fill-indigo-500 text-indigo-500 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "text-sm truncate",
                            isUnread ? "font-semibold" : "font-medium",
                            isSelected && "text-indigo-600"
                          )}
                        >
                          {extractSenderName(email.from)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(email.receivedAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate mb-1",
                        isUnread && "font-medium"
                      )}
                    >
                      {email.subject}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {email.body
                          .replace(/<[^>]*>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()
                          .slice(0, 60)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );
}

export function EmailSidebar({
  emails,
  selectedEmailId,
  onSelectEmail,
  isLoading = false,
  isRefreshing = false,
  fullAddress,
  onRefresh,
  className,
  open,
  onOpenChange,
}: EmailSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col w-80 border-r bg-muted/30",
          className
        )}
      >
        <SidebarHeader
          fullAddress={fullAddress}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <EmailList
          emails={emails}
          selectedEmailId={selectedEmailId}
          onSelectEmail={onSelectEmail}
          isLoading={isLoading}
        />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Inbox: {fullAddress}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <SidebarHeader
              fullAddress={fullAddress}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
            />
            <EmailList
              emails={emails}
              selectedEmailId={selectedEmailId}
              onSelectEmail={onSelectEmail}
              isLoading={isLoading}
              onItemClick={() => onOpenChange?.(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
