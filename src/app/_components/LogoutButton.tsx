"use client";

import { authClient } from "pnpm/server/better-auth/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <button onClick={handleLogout} className="btn-logout">
      Sair
    </button>
  );
}
