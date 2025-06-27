'use client';

import { SessionProvider, SessionProviderProps } from 'next-auth/react';
import { ReactNode, useMemo } from 'react';

// Mock session data for when authentication is disabled
export const MOCK_SESSION = {
  user: {
    id: 'mock-user-id',
    name: 'Demo User',
    email: 'demo@example.com',
    image: null,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // Check if authentication is enabled
  const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';
  
  // Only provide session if authentication is enabled
  const sessionProps = useMemo<Partial<SessionProviderProps>>(
    () => (authEnabled ? {} : { session: MOCK_SESSION }),
    [authEnabled]
  );

  return (
    <SessionProvider {...sessionProps}>
      {children}
    </SessionProvider>
  );
}
