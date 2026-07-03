"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { TimedAlert } from "@/components/TimedAlert";
import { setFlashMessage } from "@/lib/flash";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Não foi possível acessar sua conta. Verifique os dados e tente novamente.");
      return;
    }

    setFlashMessage({ type: "success", message: "Login realizado com sucesso." });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      mode="login"
      title="Acessar sua conta"
      description="Entre com seus dados para continuar no painel Minhas Finanças."
      alternateText="Ainda não possui acesso?"
      alternateHref="/register"
      alternateLabel="Criar uma conta"
    >
      <form className="form auth-form" onSubmit={handleSubmit}>
        {error ? <TimedAlert message={error} variant="error" onDismiss={() => setError("")} /> : null}

        <div className="field">
          <label htmlFor="email">E-mail cadastrado</label>
          <input
            className="input"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Senha de acesso</label>
          <input
            className="input"
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <button className="btn" disabled={loading} type="submit">
          {loading ? "Validando acesso..." : "Acessar painel"}
        </button>

        <p className="auth-note">Acesso protegido para suas informações financeiras.</p>
      </form>
    </AuthShell>
  );
}
