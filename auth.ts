import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8002"
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
    async signIn({ user, account }) {
      // Prefer the stable Google sub over Auth.js's ephemeral UUID
      const googleSub = account?.providerAccountId ?? user.id

      if (user.email) {
        try {
          const res = await fetch(`${BACKEND_URL}/users/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: googleSub,
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
            }),
          })
          if (res.ok) {
            // The backend returns the canonical DB id (may differ from googleSub
            // if this email already existed under a stale UUID).
            const data = await res.json()
            user.id = data.id ?? googleSub
          } else {
            user.id = googleSub
          }
        } catch {
          user.id = googleSub
        }
      } else {
        user.id = googleSub
      }

      return true
    },
    jwt({ token, user, trigger, session: newSession }) {
      if (user) {
        // user.id is now the canonical DB id set in signIn above
        token.id = user.id
      }
      // Allow DefaultLayout to patch the token when syncUser returns a
      // different canonical id (stale UUID session recovery).
      if (trigger === "update" && newSession?.canonicalId) {
        token.id = newSession.canonicalId
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      return session
    },
  },
})
