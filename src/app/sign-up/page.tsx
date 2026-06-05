import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "pnpm/server/better-auth";
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
        <Image src={logo} alt="Logo" style={{ width: "30vw" }} />
        <main className="login-card">
          <h1 className="login-title">Cadastrar</h1>
          <p className="login-subtitle">
            Crie sua conta para começar a usar o SeniorFit.
          </p>

          <SignUpForm />

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
              Cadastrar com GitHub
            </button>
          </form>

          <p className="signup-prompt">
            Já tem uma conta? <Link href="/">Entrar</Link>
          </p>
        </main>
      </div>
    </HydrateClient>
  );
}
