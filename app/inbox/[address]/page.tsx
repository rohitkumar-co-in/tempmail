import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { validateInboxAddress } from "@/lib/validators";
import { addRecentEmailAction } from "@/app/actions";
import { InboxLayout } from "./layout-client";

interface InboxPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({
  params,
}: InboxPageProps): Promise<Metadata> {
  const { address } = await params;
  const decodedAddress = decodeURIComponent(address);

  return {
    title: `${decodedAddress} - TempMail Inbox`,
    description: `View emails for ${decodedAddress}. Check your temporary inbox for incoming messages.`,
  };
}

export default async function InboxPage({ params }: InboxPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { address } = await params;
  const decodedAddress = decodeURIComponent(address);
  const parsed = validateInboxAddress(decodedAddress);

  if (!parsed) {
    notFound();
  }

  // Add to recent emails
  await addRecentEmailAction(decodedAddress);

  return (
    <InboxLayout
      inbox={parsed.name}
      domain={parsed.domain}
      fullAddress={decodedAddress}
    />
  );
}
