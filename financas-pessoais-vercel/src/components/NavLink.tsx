"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavIcon = "dashboard" | "subscriptions" | "records" | "profile";

function MenuIcon({ name }: { name: NavIcon }) {
  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 13.5a8 8 0 1 1 16 0" />
        <path d="M12 13l3.5-4" />
        <path d="M5.5 19h13" />
        <path d="M7 15.5h10" />
      </svg>
    );
  }

  if (name === "subscriptions") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.5 4.5h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Z" />
        <path d="m10 9 5 3-5 3V9Z" />
      </svg>
    );
  }

  if (name === "records") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3.5h10l2 2v15H5v-15l2-2Z" />
        <path d="M8.5 9h7" />
        <path d="M8.5 13h4" />
        <path d="M16 16.5c0 .9-.7 1.5-1.8 1.5-.7 0-1.3-.2-1.8-.7" />
        <path d="M12.5 15c0-.9.7-1.5 1.8-1.5.6 0 1.1.2 1.5.5" />
        <path d="M14.2 12.6v6.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function NavLink({ href, icon, children }: { href: string; icon?: NavIcon; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link className={active ? "active" : ""} href={href}>
      {icon ? (
        <span className="nav-icon" aria-hidden="true">
          <MenuIcon name={icon} />
        </span>
      ) : null}
      <span className="nav-label">{children}</span>
    </Link>
  );
}
