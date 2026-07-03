"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setFlashMessage } from "@/lib/flash";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setFlashMessage({ type: "success", message: "Você saiu da sua conta." });
    router.push("/login");
    router.refresh();
  }

  return (
    <button className="sidebar-logout" type="button" onClick={logout} disabled={loading}>
      {loading ? "Saindo..." : "Sair"}
    </button>
  );
}
