import { redirect } from "next/navigation";
import { Suspense } from "react";
import { headers } from "next/headers";
import { GmailSetup } from "./gmail-setup";
import { isGmailConfigured } from "@/lib/gmail";
import { getServerSession } from "@/lib/auth/session";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gmail Setup - TempMail",
  description: "Configure Gmail API for catch-all emails",
};

function LoadingCard() {
  return (
    <Card>
      <CardHeader className="text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default async function GmailSetupPage() {
  // Check if user is authenticated (admin only in production)
  const session = await getServerSession();

  // In production, only allow authenticated users
  // You could also add an admin check here
  if (process.env.NODE_ENV === "production" && !session?.user) {
    redirect("/login?callbackUrl=/setup/gmail");
  }

  const hasToken = await isGmailConfigured();

  // Get the host from headers to build redirect URI
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const redirectUri = `${protocol}://${host}/api/gmail/callback`;

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Suspense fallback={<LoadingCard />}>
          <GmailSetup
            clientId={process.env.GOOGLE_CLIENT_ID || ""}
            redirectUri={redirectUri}
            hasExistingToken={hasToken}
          />
        </Suspense>
      </div>
    </div>
  );
}
