import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TempMail - Temporary Email Service",
    template: "%s | TempMail",
  },
  description:
    "Create instant temporary email addresses. Secure, private, and powered by Gmail. Protect your privacy with disposable email inboxes.",
  keywords: [
    "temporary email",
    "disposable email",
    "temp mail",
    "fake email",
    "anonymous email",
  ],
  authors: [{ name: "TempMail" }],
  robots: { index: false, follow: false },
  openGraph: {
    title: "TempMail - Temporary Email Service",
    description:
      "Create instant temporary email addresses. Protect your privacy with disposable email inboxes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
