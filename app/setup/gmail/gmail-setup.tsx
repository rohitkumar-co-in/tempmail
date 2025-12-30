"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, ExternalLink, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface GmailSetupProps {
  clientId: string;
  redirectUri: string;
  hasExistingToken: boolean;
}

export function GmailSetup({
  clientId,
  redirectUri,
  hasExistingToken,
}: GmailSetupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHandledParams = useRef(false);

  // Check URL params for initial state
  const success = searchParams.get("success");
  const error = searchParams.get("error");
  const emailParam = searchParams.get("email");

  // Determine initial step based on URL params or existing token
  const getInitialStep = () => {
    if (success === "true") return 3;
    if (hasExistingToken) return 0;
    return 1;
  };

  const [step, setStep] = useState(getInitialStep);
  const [configuredEmail] = useState<string | null>(
    success === "true" ? emailParam : null
  );

  const scopes = ["https://www.googleapis.com/auth/gmail.readonly"].join(" ");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(
    scopes
  )}&access_type=offline&prompt=consent`;

  // Handle toasts and URL cleanup after mount
  useEffect(() => {
    if (hasHandledParams.current) return;
    hasHandledParams.current = true;

    if (success === "true") {
      toast.success("Gmail configured successfully!");
      router.replace("/setup/gmail");
    } else if (error) {
      toast.error(error);
      router.replace("/setup/gmail");
    }
  }, [success, error, router]);

  if (step === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Gmail Already Configured</CardTitle>
          <CardDescription>
            Your Gmail account is connected and ready to receive catch-all
            emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setStep(1)}
          >
            Reconfigure Gmail
          </Button>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 3) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Setup Complete!</CardTitle>
          <CardDescription>
            Gmail has been configured successfully.
            {configuredEmail && (
              <span className="block mt-1 font-medium text-foreground">
                {configuredEmail}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-white" />
        </div>
        <CardTitle>Gmail Setup</CardTitle>
        <CardDescription>
          Connect your catch-all Gmail account to receive emails
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">Important</p>
              <p>
                Sign in with the Gmail account that receives catch-all emails
                for your domains, not your personal account.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to authorize Gmail access. You&apos;ll be
            redirected back automatically after authorization.
          </p>
          <Button className="w-full" asChild>
            <a href={authUrl}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Connect Gmail Account
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
