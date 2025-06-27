"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Session } from "next-auth";

type Props = {
  children: React.ReactNode;
  session?: Session | null;
};

export function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider 
      session={session}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  );
}
