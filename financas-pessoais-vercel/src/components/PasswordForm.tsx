"use client";

import { FormEvent, useState } from "react";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmation) {
      setError("As senhas não conferem.");
      return;
    }

    setSaving(true);

    const response = await fetch("/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.message || "Erro ao atualizar senha.");
      return;
    }

    setPassword("");
    setConfirmation("");
    setMessage("Senha atualizada.");
  }

  return (
    <section className="profile-panel">
      <div className="profile-panel-header">
        <div>
          <p className="profile-kicker">Segurança</p>
          <h2>Alterar senha</h2>
        </div>
      </div>

      <form className="form profile-form" onSubmit={handleSubmit}>
        {error ? <div className="alert">{error}</div> : null}
        {message ? <div className="alert success">{message}</div> : null}

        <div className="field">
          <label htmlFor="new-password">Nova senha</label>
          <input
            className="input"
            id="new-password"
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="confirm-password">Confirmar senha</label>
          <input
            className="input"
            id="confirm-password"
            minLength={6}
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            required
          />
        </div>

        <div className="actions">
          <button className="btn" disabled={saving} type="submit">
            {saving ? "Salvando..." : "Salvar senha"}
          </button>
        </div>
      </form>
    </section>
  );
}
