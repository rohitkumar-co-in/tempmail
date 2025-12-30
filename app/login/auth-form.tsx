"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Shield, Zap, Clock } from "lucide-react";

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleSignIn() {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      toast.error("Failed to sign in with Google");
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-linear-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">
          Welcome to{" "}
          <span className="bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            TempMail
          </span>
        </h1>
        <p className="text-muted-foreground">
          Secure, disposable email addresses at your fingertips
        </p>
      </div>

      {/* Login Card */}
      <Card className="border-2 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">Sign In</CardTitle>
          <CardDescription>
            Use your Google account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 flex items-center justify-center gap-3 text-base hover:bg-accent"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Only verified users can sign in
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-linear-to-r from-indigo-500/5 to-purple-600/5 border">
          <Shield className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
          <p className="text-xs font-medium">Secure</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-linear-to-r from-indigo-500/5 to-purple-600/5 border">
          <Zap className="h-5 w-5 mx-auto mb-1 text-purple-500" />
          <p className="text-xs font-medium">Instant</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-linear-to-r from-indigo-500/5 to-purple-600/5 border">
          <Clock className="h-5 w-5 mx-auto mb-1 text-indigo-500" />
          <p className="text-xs font-medium">Temporary</p>
        </div>
      </div>
    </div>
  );
}
