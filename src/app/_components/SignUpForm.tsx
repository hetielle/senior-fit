"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "pnpm/server/better-auth/client";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsPending(true);

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      // @ts-expect-error -- role is an additional field configured in better-auth
      role,
    });

    if (result.error) {
      setError(result.error.message ?? "Erro ao criar conta.");
      setIsPending(false);
      return;
    }

    router.push(role === "INSTRUCTOR" ? "/instructor/students" : "/workouts");
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Nome
        </label>
        <input
          id="name"
          type="text"
          placeholder="Seu nome completo"
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

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

      <div className="form-group">
        <label htmlFor="confirm-password" className="form-label">
          Confirmar senha
        </label>
        <input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          className="form-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Tipo de conta</label>
        <div className="role-options">
          <label className={`role-option ${role === "STUDENT" ? "role-option-active" : ""}`}>
            <input
              type="radio"
              name="role"
              value="STUDENT"
              checked={role === "STUDENT"}
              onChange={() => setRole("STUDENT")}
            />
            <span className="role-option-label">Sou Aluno</span>
            <span className="role-option-desc">Acesso aos meus treinos</span>
          </label>
          <label className={`role-option ${role === "INSTRUCTOR" ? "role-option-active" : ""}`}>
            <input
              type="radio"
              name="role"
              value="INSTRUCTOR"
              checked={role === "INSTRUCTOR"}
              onChange={() => setRole("INSTRUCTOR")}
            />
            <span className="role-option-label">Sou Instrutor</span>
            <span className="role-option-desc">Gerencio alunos e treinos</span>
          </label>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? "Criando conta..." : "Cadastrar"}
      </button>
    </form>
  );
}
