"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "pnpm/server/better-auth/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      setError("E-mail ou senha incorretos.");
      setIsPending(false);
      return;
    }

    const role = (result.data?.user as { role?: string })?.role ?? "STUDENT";
    router.push(role === "INSTRUCTOR" ? "/instructor/students" : "/workouts");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          placeholder="voce@exemplo.com"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Senha
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
