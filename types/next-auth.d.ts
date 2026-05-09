import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    _id?: string;
    user: {
      id?: string;
      _id?: string;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      bio?: string | null;
      address?: string | null;
      avatar?: {
        public_id?: string;
        url?: string;
      };
    };
  }

  interface User {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    _id?: string;
    user?: Session["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    role?: string;
    _id?: string;
    user?: import("next-auth").Session["user"];
  }
}
