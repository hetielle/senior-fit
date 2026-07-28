import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "pnpm/server/better-auth/server";
import logo from "../imgs/logo.png";
import { HydrateClient } from "pnpm/trpc/server";
import { SignUpForm } from "../_components/SignUpForm";
import "../page.css";
import Link from "next/link";

export default async function SignUp() {
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
          <h1 className="login-title">Cadastrar</h1>
          <p className="login-subtitle">
            Crie sua conta para começar a usar o SeniorFit.
          </p>

          <SignUpForm />

          <p className="signup-prompt">
            Já tem uma conta? <Link href="/">Entrar</Link>
          </p>
        </main>
      </div>
    </HydrateClient>
  );
}
