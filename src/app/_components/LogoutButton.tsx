"use client";

import { useState } from "react";
import { authClient } from "pnpm/server/better-auth/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    await authClient.signOut();
    router.push("/");
  }

  return (
    <>
      <button onClick={handleLogout} className="btn-logout" disabled={isPending}>
        Sair
      </button>

      {isPending && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <div className="logout-spinner" />
            <p className="logout-modal-text">Saindo...</p>
          </div>
        </div>
      )}
    </>
  );
}
