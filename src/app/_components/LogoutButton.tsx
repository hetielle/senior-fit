"use client";

import { useState } from "react";
import { authClient } from "pnpm/server/better-auth/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleConfirm() {
    setIsConfirming(false);
    setIsPending(true);
    await authClient.signOut();
    router.push("/");
  }

  return (
    <>
      <button onClick={() => setIsConfirming(true)} className="btn-logout" disabled={isPending}>
        Sair
      </button>

      {isConfirming && (
        <div className="logout-overlay" onClick={() => setIsConfirming(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <p className="logout-modal-text">Deseja sair da sua conta?</p>
            <div className="logout-confirm-actions">
              <button className="btn-logout-cancel" onClick={() => setIsConfirming(false)}>
                Cancelar
              </button>
              <button className="btn-logout-confirm" onClick={handleConfirm}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

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
