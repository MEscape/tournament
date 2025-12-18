import NextAuth, { DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcrypt"
import { prisma } from "./prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      imageUrl: string
      role: "ADMIN" | "USER"
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    username: string
    imageUrl: string
    role: "ADMIN" | "USER"
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    username: string
    imageUrl: string
    role: "ADMIN" | "USER"
  }
}

export const { handlers, signIn, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as never,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        })

        if (!user) {
          return null
        }

        // Verify password
        const isValid = await compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        // Return user without password
        return {
          id: user.id,
          username: user.username,
          imageUrl: user.imageUrl,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.imageUrl = user.imageUrl
        token.role = user.role
      }

      // Refresh token rotation
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        })

        if (dbUser) {
          token.username = dbUser.username
          token.imageUrl = dbUser.imageUrl
          token.role = dbUser.role
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.imageUrl = token.imageUrl as string
        session.user.role = token.role as "ADMIN" | "USER"
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
  if (!session.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin only")
  }
  return session
}
