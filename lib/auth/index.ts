// Client exports only - for use in "use client" components
export { authClient, signIn, signOut, useSession } from "./auth-client";

// Server exports should be imported directly from their files:
// import { auth } from "@/lib/auth/auth"
// import { getServerSession, requireAuth } from "@/lib/auth/session"
