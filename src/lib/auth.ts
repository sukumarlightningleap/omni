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
        // Normalize emails to avoid case-sensitivity or spacing issues
        const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
        const currentUserEmail = user.email?.toLowerCase().trim();

        // 1. Identify if this user is the "Chosen One" defined in Vercel
        const isMasterAdmin = masterAdminEmail && currentUserEmail === masterAdminEmail;

        if (isMasterAdmin) {
          // 2. AUTO-PROMOTION: If they match the ENV, force their DB role to ADMIN
          // This fulfills your plan: just change the ENV, and the user becomes Admin on login.
          await prisma.user.update({
            where: { email: currentUserEmail },
            data: { role: 'ADMIN' }
          });
          token.role = 'ADMIN';
        } else {
          // 3. SECURITY GUARD: If someone else was previously an Admin,
          // but the ENV changed, demote them to CUSTOMER immediately.
          token.role = (user as any).role === 'ADMIN' ? 'CUSTOMER' : (user as any).role;
        }

        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
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
