"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "pnpm/server/better-auth/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      setError("E-mail ou senha incorretos. Verifique seus dados e tente novamente.");
      setIsPending(false);
      return;
    }

    const user = result.data?.user as { role?: string; isActive?: boolean } | undefined;

    if (user?.isActive === false) {
      await authClient.signOut();
      setError("Sua conta está inativa. Entre em contato com seu instrutor.");
      setIsPending(false);
      return;
    }

    const role = user?.role ?? "STUDENT";
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
          autoComplete="email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Senha
        </label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="form-input password-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
