import Image from "next/image";
import logo from "../imgs/logo.png";
import { getSession } from "pnpm/server/better-auth/server";
import { LogoutButton } from "./LogoutButton";

type Props = {
  activePath: string;
};

const STUDENT_NAV = [
  { href: "/workouts", label: "Hoje" },
  { href: "/schedule", label: "Semana" },
  { href: "/profile", label: "Perfil" },
];

const INSTRUCTOR_NAV = [
  { href: "/instructor/students", label: "Meus Alunos" },
];

export async function AppHeader({ activePath }: Props) {
  const session = await getSession();
  const nav =
    session?.user.role === "INSTRUCTOR" ? INSTRUCTOR_NAV : STUDENT_NAV;

  return (
    <header className="app-header">
      <Image src={logo} alt="Logo" className="app-logo" />
      <nav className="header-nav">
        {nav.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className={`nav-link${activePath.startsWith(href) && href !== "/" ? " nav-link-active" : ""}`}
          >
            {label}
          </a>
        ))}
      </nav>
      <LogoutButton />
    </header>
  );
}
