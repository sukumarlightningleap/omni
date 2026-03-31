import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "CUSTOMER" | "VIP"
  }
  interface Session {
    user: {
      role?: "ADMIN" | "CUSTOMER" | "VIP"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "CUSTOMER" | "VIP"
  }
}
