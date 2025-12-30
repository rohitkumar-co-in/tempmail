import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { getRecentEmailsAction } from "@/app/actions";
import { DashboardLayout } from "./layout-client";

export const metadata: Metadata = {
  title: "Dashboard - TempMail",
  description:
    "Create and manage your temporary email addresses. Generate new inboxes instantly and access your recent email addresses.",
};

// Get allowed domains from environment
function getAllowedDomains(): string[] {
  const domains = process.env.ALLOWED_DOMAINS || "";
  return domains
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
}

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const domains = getAllowedDomains();
  const recentEmails = await getRecentEmailsAction();

  return <DashboardLayout domains={domains} recentEmails={recentEmails} />;
}
