import axios from "axios";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getBaseUrl } from "./utils";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const response = await axios.post(`${getBaseUrl()}/auth/login`, {
          email: credentials.email,
          password: credentials.password,
        });

        const payload = response.data?.data;
        if (!payload?.accessToken || payload?.role !== "seller") {
          return null;
        }

        return {
          id: payload._id,
          _id: payload._id,
          role: payload.role,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          user: {
            id: payload._id,
            _id: payload._id,
            name: payload.user?.name,
            email: payload.user?.email,
            phone: payload.user?.phone,
            bio: payload.user?.bio,
            address: payload.user?.address,
            avatar: payload.user?.avatar,
          },
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token._id = user._id;
        token.user = user.user;
      }

      if (trigger === "update" && session?.user) {
        token.user = {
          ...token.user,
          ...session.user,
        };
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.role = token.role;
      session._id = token._id;
      session.user = {
        ...session.user,
        ...token.user,
      };
      return session;
    },
  },
};
