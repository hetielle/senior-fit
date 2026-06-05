import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "pnpm/server/better-auth/server";

type UserWithRole = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthSession = {
  user: UserWithRole;
  session: { id: string; token: string; expiresAt: Date; userId: string };
};

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) redirect("/");
  return session as unknown as AuthSession;
}

export async function requireStudent(): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.user.role === "INSTRUCTOR") redirect("/instructor/students");
  return session;
}

export async function requireInstructor(): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.user.role !== "INSTRUCTOR") redirect("/workouts");
  return session;
}
