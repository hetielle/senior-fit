import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "pnpm/server/better-auth";

export const { GET, POST } = toNextJsHandler(auth.handler);
