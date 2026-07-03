"use client";

import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LogoutButton } from "@/components/LogoutButton";
import { NavLink } from "@/components/NavLink";

type AppShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
  };
};

export function AppShell({ children, user }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <main className={`app-shell ${menuOpen ? "" : "menu-collapsed"}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <button
            className="icon-btn"
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <BrandLogo className="brand brand-logo-light" />
        </div>

        <nav className="nav" aria-label="Menu principal">
          <NavLink href="/dashboard" icon="dashboard">
            Dashboard
          </NavLink>
          <NavLink href="/assinaturas" icon="subscriptions">
            Assinaturas
          </NavLink>
          <NavLink href="/dividas" icon="records">
            Dívidas e valores
          </NavLink>
          <NavLink href="/perfil" icon="profile">
            Perfil
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <span>Logado como</span>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
          <LogoutButton />
        </div>
      </aside>

      <section className="content">{children}</section>
    </main>
  );
}
