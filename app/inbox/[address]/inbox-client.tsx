"use client";

import { useEffect, useState, useCallback } from "react";
import { getEmailsAction } from "@/app/actions";
import type { Email } from "@/lib/types";
import { EmailSidebar } from "@/components/email-sidebar";
import { EmailViewer } from "@/components/email-viewer";
import { toast } from "sonner";

interface InboxClientWrapperProps {
  inbox: string;
  domain: string;
  fullAddress: string;
}

export function InboxClientWrapper({
  inbox,
  domain,
  fullAddress,
}: InboxClientWrapperProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const fetchEmails = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getEmailsAction(inbox, domain);

      if (!result.success) {
        toast.error(result.error || "Failed to fetch emails");
        return;
      }

      setEmails(result.data?.emails || []);
    } catch {
      toast.error("Failed to fetch emails");
    } finally {
      setIsLoading(false);
    }
  }, [inbox, domain]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  function handleSelectEmail(email: Email) {
    setSelectedEmail(email);
  }

  return (
    <>
      <EmailSidebar
        emails={emails}
        selectedEmailId={selectedEmail?.id || null}
        onSelectEmail={handleSelectEmail}
        isLoading={isLoading}
        fullAddress={fullAddress}
        onRefresh={fetchEmails}
      />
      <EmailViewer email={selectedEmail} />
    </>
  );
}
