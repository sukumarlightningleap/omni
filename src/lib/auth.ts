import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL;
        const isMasterAdmin = masterAdminEmail && user.email?.toLowerCase() === masterAdminEmail.toLowerCase();

        // Strict Enforcement: Only the Master Admin can have the ADMIN role in the session
        if ((user as any).role === 'ADMIN' && !isMasterAdmin) {
          token.role = 'CUSTOMER';
        } else {
          token.role = (user as any).role;
        }
        
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL;
        const isMasterAdmin = masterAdminEmail && token.email?.toLowerCase() === masterAdminEmail.toLowerCase();

        // Final Security Gate: Ensure role consistency in the session object
        if (token.role === 'ADMIN' && !isMasterAdmin) {
          session.user.role = 'CUSTOMER';
        } else {
          session.user.role = token.role as any;
        }
        
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email as string } });
        if (!user || !user.password) return null;
        const isValid = await compare(credentials.password as string, user.password);
        return isValid ? user : null;
      }
    })
  ],
})
