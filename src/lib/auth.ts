import { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authConfigEdge } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authConfig = {
  ...authConfigEdge,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const raw = {
            email: String(credentials?.email ?? "").trim(),
            password: String(credentials?.password ?? "").trim(),
          };

          const parsed = credentialsSchema.safeParse(raw);

          if (!parsed.success) {
            return null;
          }

          const user = await db.query.users.findFirst({
            where: eq(users.email, parsed.data.email),
          });

          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await compare(parsed.data.password, user.password);

          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
            role: user.role,
            companyId: user.companyId,
          };
        } catch (err) {
          console.error(
            "[auth] authorize error:",
            err instanceof Error ? err.message : "unknown"
          );
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;
