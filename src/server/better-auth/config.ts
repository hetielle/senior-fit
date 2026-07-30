import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { db } from "pnpm/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        input: true,
      },
      isActive: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
