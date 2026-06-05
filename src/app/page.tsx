import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "pnpm/server/better-auth";
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
        <Image src={logo} alt="Logo" style={{ width: "30vw" }} />
        <main className="login-card">
          <h1 className="login-title">Entrar</h1>
          <p className="login-subtitle">
            Bem-vindo de volta! Acesse sua conta para continuar.
          </p>

          <LoginForm />

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">ou</span>
            <div className="divider-line" />
          </div>

          <form>
            <button
              type="submit"
              className="btn-social"
              formAction={async () => {
                "use server";
                const res = await auth.api.signInSocial({
                  body: {
                    provider: "github",
                    callbackURL: "/workouts",
                  },
                });
                if (!res.url) {
                  throw new Error("No URL returned from signInSocial");
                }
                redirect(res.url);
              }}
            >
              Entrar com GitHub
            </button>
          </form>

          <p className="signup-prompt">
            Não tem uma conta? <a href="/sign-up">Cadastre-se</a>
          </p>
        </main>
      </div>
    </HydrateClient>
  );
}
