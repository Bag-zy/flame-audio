import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/user";

// Extend the built-in session and user types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
    };
  }
  
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

export const authConfig: NextAuthConfig = {
  // Configure authentication providers
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password');
          return null;
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email as string });
          
          if (!user) {
            console.log('No user found with email:', credentials.email);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password as string, user.password);
          
          if (!isValid) {
            console.log('Invalid password for user:', credentials.email);
            return null;
          }

          // Return user object without the password
          const { password, ...userWithoutPassword } = user.toObject();
          console.log('User authenticated successfully:', userWithoutPassword.email);
          return userWithoutPassword;
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      },
    }),
  ],
  
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          image: token.image as string | null | undefined,
        };
      }
      return session;
    },
  },
  
  // No custom pages - using modal authentication only
  
  // Base URL configuration
  basePath: '/api/auth',
  
  // Session configuration
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  
  // JWT configuration
  // Note: secret is set at the root level
  // No additional JWT options needed here as we're using the session strategy
  
  // Cookie configuration for session management
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
      },
    },
  },
  
  // Trust the host header in production when behind a proxy
  trustHost: process.env.NODE_ENV === 'production',
  
  // Add debug logging for session events
  events: {
    async signIn(message) {
      console.log('User signed in:', message.user?.email);
    },
    async session(message) {
      console.log('Session active for user:', message.session?.user?.email);
    },
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === 'development',
  
  // Session configuration
  useSecureCookies: process.env.NODE_ENV === 'production',
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  
  // Ensure cookies are accessible across all subdomains in production
  // and properly scoped to the domain
  // Note: 'url' is not a valid property in NextAuthConfig, use NEXTAUTH_URL environment variable instead
} satisfies NextAuthConfig;
