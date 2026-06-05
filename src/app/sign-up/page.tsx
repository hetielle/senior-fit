import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "pnpm/server/better-auth";
import { getSession } from "pnpm/server/better-auth/server";
import logo from "../imgs/logo.png";
import { HydrateClient } from "pnpm/trpc/server";
import "../page.css";

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

          <form className="form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nome
              </label>
              <input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                className="form-input"
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
              />
            </div>

            <button type="submit" className="btn-primary">
              Cadastrar
            </button>
          </form>

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
            Já tem uma conta? <a href="/">Entrar</a>
          </p>
        </main>
      </div>
    </HydrateClient>
  );
}
