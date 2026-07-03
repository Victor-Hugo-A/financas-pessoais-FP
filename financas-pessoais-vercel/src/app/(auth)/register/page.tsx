"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/AuthShell";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Não foi possível criar sua conta.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      mode="register"
      title="Criar conta"
      description="Cadastre-se para organizar suas assinaturas, dívidas e valores a receber."
      alternateText="Já tem conta?"
      alternateHref="/login"
      alternateLabel="Entrar"
    >
      <form className="form auth-form" onSubmit={handleSubmit}>
        {error ? <div className="alert">{error}</div> : null}

        <div className="field">
          <label htmlFor="name">Nome</label>
          <input
            className="input"
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            className="input"
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            className="input"
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button className="btn" disabled={loading} type="submit">
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </AuthShell>
  );
}
