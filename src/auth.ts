import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);