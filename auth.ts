import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8001"
).replace(/\/$/, "")

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // Upsert the user row in our DB whenever they log in.
      // Runs server-side — failures are silently swallowed so they never
      // block the OAuth flow.
      if (user.id && user.email) {
        try {
          await fetch(`${BACKEND_URL}/users/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
            }),
          })
        } catch {
          // Never block login if the backend is unreachable
        }
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
})
