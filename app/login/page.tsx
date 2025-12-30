import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/session";
import { AuthForm } from "./auth-form";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In - TempMail",
  description:
    "Sign in to TempMail with your Google account to create and manage temporary email addresses.",
};

export default async function LoginPage() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto ">
      {/* Header */}
      <header className="p-4 md:p-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            <Mail className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-linear-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            TempMail
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthForm />
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Secure temporary email service</p>
      </footer>
    </div>
  );
}
