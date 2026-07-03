import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { FlashMessageOutlet } from "@/components/FlashMessageOutlet";

type AuthShellProps = {
  mode: "login" | "register";
  title: string;
  description: string;
  alternateText: string;
  alternateHref: string;
  alternateLabel: string;
  children: ReactNode;
};

export function AuthShell({
  mode,
  title,
  description,
  alternateText,
  alternateHref,
  alternateLabel,
  children
}: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <main className="auth-page">
      <section className="auth-shell" aria-label="Acesso ao Minhas Finanças">
        <aside className="auth-visual" aria-label="Planejamento financeiro">
          <div className="auth-visual-top">
            <BrandLogo className="brand-logo-light" />
          </div>

          <div className="auth-visual-copy">
            <span className="auth-eyebrow">Gestão financeira pessoal</span>
            <h2>Controle suas finanças com clareza.</h2>
            <p>Acompanhe assinaturas, dívidas e valores pendentes em um painel objetivo e seguro.</p>
          </div>

          <div className="auth-metrics" aria-label="Destaques financeiros">
            <span>
              <strong>Mês</strong>
              <small>visão atual</small>
            </span>
            <span>
              <strong>Saldo</strong>
              <small>a pagar e receber</small>
            </span>
            <span>
              <strong>Privado</strong>
              <small>acesso pessoal</small>
            </span>
          </div>
        </aside>

        <section className="auth-panel">
          <div className="auth-panel-header">
            <div>
              <span className="auth-panel-kicker">{isLogin ? "Bem-vindo de volta" : "Novo acesso"}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>

            <nav className="auth-switch" aria-label="Alternar entre login e cadastro">
              <Link className={isLogin ? "active" : undefined} href="/login">
                Login
              </Link>
              <Link className={!isLogin ? "active" : undefined} href="/register">
                Cadastro
              </Link>
            </nav>
          </div>

          <FlashMessageOutlet />

          {children}

          <div className="auth-link">
            {alternateText} <Link href={alternateHref}>{alternateLabel}</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
