import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { saveGmailConfig } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/setup/gmail?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/setup/gmail?error=No code received", request.url)
    );
  }

  try {
    // Exchange code for tokens directly
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${request.nextUrl.origin}/api/gmail/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL(
          `/setup/gmail?error=${encodeURIComponent(
            "No refresh token received. Revoke access at https://myaccount.google.com/permissions and try again."
          )}`,
          request.url
        )
      );
    }

    // Try to get email from Gmail profile (doesn't require additional scope)
    let email: string | undefined;
    try {
      oauth2Client.setCredentials(tokens);
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });
      const profile = await gmail.users.getProfile({ userId: "me" });
      email = profile.data.emailAddress || undefined;
    } catch {
      // Email is optional, continue without it
      console.log("Could not fetch Gmail profile, continuing without email");
    }

    // Save to database
    await saveGmailConfig(tokens.refresh_token, email);

    // Redirect with success
    return NextResponse.redirect(
      new URL(
        `/setup/gmail?success=true${
          email ? `&email=${encodeURIComponent(email)}` : ""
        }`,
        request.url
      )
    );
  } catch (err) {
    console.error("Gmail callback error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Failed to configure Gmail";
    return NextResponse.redirect(
      new URL(
        `/setup/gmail?error=${encodeURIComponent(errorMessage)}`,
        request.url
      )
    );
  }
}
