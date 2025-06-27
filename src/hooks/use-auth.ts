"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useAuth({
  required = false,
  redirectTo = "/auth/login",
  redirectIfFound = false,
}: UseAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = !!session?.user;
  const isLoadingSession = status === "loading";

  useEffect(() => {
    // If redirectIfFound is also set, session will not cause a redirect
    if (isLoadingSession) return;

    // If required and user is not logged in, redirect to login page
    if (required && !isAuthenticated) {
      router.push(redirectTo);
    }
    // If redirectIfFound is true and user is logged in, redirect to redirectTo
    else if (redirectIfFound && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [
    isAuthenticated,
    isLoadingSession,
    redirectIfFound,
    redirectTo,
    required,
    router,
  ]);

  const handleSignIn = useCallback(
    async (provider?: string, credentials?: Record<string, string>) => {
      setIsLoading(true);
      try {
        const result = await signIn(provider || "credentials", {
          ...credentials,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        toast({
          title: "Authentication Error",
          description:
            error instanceof Error
              ? error.message
              : "An error occurred during sign in",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign Out Error",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    session,
    user: session?.user,
    isAuthenticated,
    isLoading: isLoading || isLoadingSession,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}

// Helper hook for pages that require authentication
export function useRequireAuth(redirectTo = "/auth/login") {
  const { isAuthenticated, isLoading, ...rest } = useAuth({ required: true, redirectTo });
  return { isAuthenticated, isLoading, ...rest };
}
