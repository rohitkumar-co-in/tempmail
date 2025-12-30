"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { InboxGenerator } from "@/components/inbox-generator";

interface RecentEmail {
  address: string;
  lastUsed: string;
}

interface DashboardLayoutProps {
  domains: string[];
  recentEmails: RecentEmail[];
}

export function DashboardLayout({
  domains,
  recentEmails,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRecentEmailsChange = useCallback(() => {
    // Refresh the page to re-fetch recent emails from server
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header showMenuButton={true} onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex-1 flex max-w-6xl mx-auto w-full ">
        <Sidebar
          recentEmails={recentEmails}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          onRecentEmailsChange={handleRecentEmailsChange}
        />
        <InboxGenerator domains={domains} />
      </div>
    </div>
  );
}
