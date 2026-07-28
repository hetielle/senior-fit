import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "pnpm/server/better-auth/server";
import logo from "./imgs/logo.png";
import { HydrateClient } from "pnpm/trpc/server";
import { LoginForm } from "./_components/LoginForm";
import "./page.css";

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect("/workouts");
  }

  return (
    <HydrateClient>
      <div className="page-wrapper">
        <Image src={logo} alt="Logo" className="login-logo-side" />
        <main className="login-card">
          <Image src={logo} alt="Logo" className="login-logo-top" />
          <h1 className="login-title">Entrar</h1>
          <p className="login-subtitle">
            Bem-vindo de volta! Acesse sua conta para continuar.
          </p>

          <LoginForm />

          <p className="signup-prompt">
            Não tem uma conta? <a href="/sign-up">Cadastre-se</a>
          </p>
        </main>
      </div>
    </HydrateClient>
  );
}
