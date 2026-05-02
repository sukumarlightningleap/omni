// src/lib/auth.ts
import NextAuth from "next-auth"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const masterEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
        const loginEmail = user.email?.toLowerCase().trim();

        if (masterEmail && loginEmail === masterEmail) {
          // AUTO-PROMOTION: Force the role to ADMIN in the DB
          await prisma.user.update({
            where: { email: loginEmail },
            data: { role: 'ADMIN' }
          });
          token.role = 'ADMIN';
        } else {
          token.role = (user as any).role || 'CUSTOMER';
        }
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as any;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Find the user - this is where the "Can't reach database" error was happening
        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase().trim() }
        });

        if (!user || !user.password) return null;
        const isValid = await compare(credentials.password as string, user.password);
        return isValid ? user : null;
      }
    })
  ],
})
