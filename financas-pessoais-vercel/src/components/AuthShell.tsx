import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";

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
      <section className="auth-shell" aria-label="Acesso ao Finanças Pessoais">
        <aside className="auth-visual" aria-label="Planejamento financeiro">
          <div className="auth-visual-top">
            <BrandLogo className="brand-logo-light" />
          </div>

          <div className="auth-visual-copy">
            <span className="auth-eyebrow">Controle financeiro</span>
            <h2>Veja seus números com mais clareza.</h2>
            <p>Organize assinaturas, dívidas e valores a receber em um painel simples.</p>
          </div>

          <div className="auth-metrics" aria-label="Destaques financeiros">
            <span>
              <strong>30 dias</strong>
              <small>visão do mês</small>
            </span>
            <span>
              <strong>R$</strong>
              <small>controle total</small>
            </span>
            <span>
              <strong>24h</strong>
              <small>acesso rápido</small>
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

          {children}

          <div className="auth-link">
            {alternateText} <Link href={alternateHref}>{alternateLabel}</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
