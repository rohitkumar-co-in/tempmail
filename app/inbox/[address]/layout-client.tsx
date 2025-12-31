"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getEmailsAction, markEmailAsReadAction } from "@/app/actions";
import type { Email } from "@/lib/types";
import { Header } from "@/components/header";
import { EmailSidebar } from "@/components/email-sidebar";
import { EmailViewer } from "@/components/email-viewer";
import { toast } from "sonner";

const REFRESH_INTERVAL = 30000; // 30 seconds

interface InboxLayoutProps {
  inbox: string;
  domain: string;
  fullAddress: string;
}

export function InboxLayout({ inbox, domain, fullAddress }: InboxLayoutProps) {
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isFirstLoad = useRef(true);

  const fetchEmails = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }

      try {
        const result = await getEmailsAction(inbox, domain);

        if (!result.success) {
          // Redirect to Gmail setup if token is invalid
          if (result.needsGmailSetup) {
            toast.error("Gmail needs to be configured");
            router.push("/setup/gmail");
            return;
          }

          if (isFirstLoad.current) {
            toast.error(result.error || "Failed to fetch emails");
          }
          return;
        }

        const newEmails = result.data?.emails || [];

        // Check for new emails (only show toast after initial load)
        if (!isFirstLoad.current && newEmails.length > emails.length) {
          const newCount = newEmails.length - emails.length;
          toast.success(
            `${newCount} new email${newCount > 1 ? "s" : ""} received!`
          );
        }

        setEmails(newEmails);

        // Update selected email if it exists in new list
        if (selectedEmail) {
          const updated = newEmails.find((e) => e.id === selectedEmail.id);
          if (updated) {
            setSelectedEmail(updated);
          }
        }
      } catch (err) {
        console.error("Fetch emails error:", err);
        if (isFirstLoad.current) {
          toast.error("Failed to fetch emails");
        }
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
        isFirstLoad.current = false;
      }
    },
    [inbox, domain, emails.length, selectedEmail, router]
  );

  // Initial fetch
  useEffect(() => {
    fetchEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inbox, domain]); // Only depend on inbox/domain for initial fetch

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmails(false); // Silent refresh, no indicator
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchEmails]);

  const handleRefresh = useCallback(() => {
    fetchEmails(true); // Show refresh indicator
  }, [fetchEmails]);

  async function handleSelectEmail(email: Email) {
    setSelectedEmail(email);
    setSidebarOpen(false);

    // Mark as read if not already
    if (!email.isRead) {
      await markEmailAsReadAction(email.id);
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, isRead: true } : e))
      );
      setSelectedEmail({ ...email, isRead: true });
    }
  }

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header showMenuButton={true} onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 flex overflow-hidden max-w-6xl mx-auto w-full min-w-0">
        <EmailSidebar
          emails={emails}
          selectedEmailId={selectedEmail?.id || null}
          onSelectEmail={handleSelectEmail}
          isLoading={isInitialLoading}
          isRefreshing={isRefreshing}
          fullAddress={fullAddress}
          onRefresh={handleRefresh}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
        <EmailViewer email={selectedEmail} />
      </div>
    </div>
  );
}
