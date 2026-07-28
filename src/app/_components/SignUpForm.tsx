"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "pnpm/server/better-auth/client";

const ERROR_MESSAGES: Record<string, string> = {
  "User already exists": "Já existe uma conta com este e-mail. Tente entrar ou use outro e-mail.",
  "Invalid email": "O e-mail informado não é válido.",
  "Password too short": "A senha deve ter pelo menos 8 caracteres.",
  "Invalid password": "A senha informada não é válida.",
};

function friendlyError(raw: string | undefined): string {
  if (!raw) return "Ocorreu um erro. Tente novamente.";
  return ERROR_MESSAGES[raw] ?? "Ocorreu um erro ao criar a conta. Tente novamente.";
}

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }

    setIsPending(true);

    const result = await authClient.signUp.email({
      name,
      email,
      password,
      role,
    });

    if (result.error) {
      setError(friendlyError(result.error.message));
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
          autoComplete="name"
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
            autoComplete="new-password"
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

      <div className="form-group">
        <label htmlFor="confirm-password" className="form-label">
          Confirmar senha
        </label>
        <div className="password-wrapper">
          <input
            id="confirm-password"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className="form-input password-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirm((v) => !v)}
            aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
          >
            {showConfirm ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tipo de conta</label>
        <div className="role-options">
          <label
            className={`role-option ${role === "STUDENT" ? "role-option-active" : ""}`}
          >
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
          <label
            className={`role-option ${role === "INSTRUCTOR" ? "role-option-active" : ""}`}
          >
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

      {error && <p className="form-error" role="alert">{error}</p>}

      <button type="submit" className="btn-primary" disabled={isPending}>
        {isPending ? "Criando conta..." : "Cadastrar"}
      </button>
    </form>
  );
}
