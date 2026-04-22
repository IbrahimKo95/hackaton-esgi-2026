import { compare } from "bcryptjs";
import type { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";

import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/server/http";

export type AppRole = "admin" | "inspector" | "user";

function normalizeRole(role: string | null | undefined): AppRole {
  const normalized = role?.toLowerCase();
  if (normalized === "admin" || normalized === "inspector") {
    return normalized;
  }
  return "user";
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });

        if (!user?.password) {
          return null;
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || user.id,
          role: normalizeRole(user.role?.name),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: AppRole }).role ?? "user";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = token.role === "admin" || token.role === "inspector" ? token.role : "user";
      }

      return session;
    },
  },
};

export async function getAuthSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

export async function requireSession(): Promise<Session> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new HttpError(401, "Authentication required.");
  }
  return session;
}

export async function requireRole(allowed: AppRole[]): Promise<Session> {
  const session = await requireSession();
  const role = session.user.role;

  if (!role || !allowed.includes(role)) {
    throw new HttpError(403, "Insufficient permissions.");
  }

  return session;
}
