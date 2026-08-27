import type { NextAuthConfig } from "next-auth"

export default {
  providers: [],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig
