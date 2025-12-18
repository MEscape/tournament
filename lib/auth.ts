import NextAuth, { DefaultSession } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "USER"
      username: string
      imageUrl: string
    } & DefaultSession["user"]
  }

  interface User {
    role: "ADMIN" | "USER"
    username: string
    imageUrl: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "USER"
    username: string
    imageUrl: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/welcome",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        accessCode: { label: "Access Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.accessCode) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        })

        if (!user) {
          return null
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          imageUrl: user.imageUrl,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.username = user.username
        token.imageUrl = user.imageUrl
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.username = token.username
        session.user.imageUrl = token.imageUrl
      }
      return session
    },
  },
})

export const getSession = async () => {
  return await auth()
}

export const requireAuth = async () => {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

export const requireAdmin = async () => {
  const session = await requireAuth()
  if (session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin only")
  }
  return session
}


