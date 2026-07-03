"use client";

import { Badge } from "@/components/Badge";
import { SummaryCard } from "@/components/SummaryCard";
import { SubscriptionLogo } from "@/components/SubscriptionLogo";
import { formatCurrency } from "@/lib/format";
import { SubscriptionDTO, SubscriptionStatus, subscriptionStatusLabel } from "@/types/app";
import { FormEvent, useEffect, useMemo, useState } from "react";

type SubscriptionForm = {
  platformName: string;
  monthlyValue: string;
  dueDay: string;
  status: SubscriptionStatus;
  category: string;
  notes: string;
};

const emptyForm: SubscriptionForm = {
  platformName: "",
  monthlyValue: "",
  dueDay: "10",
  status: "ACTIVE",
  category: "Streaming",
  notes: ""
};

export default function SubscriptionsPage() {
  const [items, setItems] = useState<SubscriptionDTO[]>([]);
  const [form, setForm] = useState<SubscriptionForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadItems() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("status", statusFilter);
    params.set("category", categoryFilter);

    const response = await fetch(`/api/subscriptions?${params.toString()}`, { cache: "no-store" });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Erro ao carregar assinaturas.");
      return;
    }

    setItems(data.subscriptions);
  }

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter]);

  const totals = useMemo(() => {
    const activeTotal = items
      .filter((item) => item.status === "ACTIVE")
      .reduce((sum, item) => sum + item.monthlyValue, 0);

    return {
      activeTotal,
      annualTotal: activeTotal * 12,
      activeCount: items.filter((item) => item.status === "ACTIVE").length
    };
  }, [items]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(items.map((item) => item.category))).filter(Boolean);
    return values.sort((a, b) => a.localeCompare(b));
  }, [items]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(item: SubscriptionDTO) {
    setEditingId(item.id);
    setForm({
      platformName: item.platformName,
      monthlyValue: String(item.monthlyValue),
      dueDay: String(item.dueDay),
      status: item.status,
      category: item.category,
      notes: item.notes || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const response = await fetch(editingId ? `/api/subscriptions/${editingId}` : "/api/subscriptions", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.message || "Erro ao salvar assinatura.");
      return;
    }

    setMessage(editingId ? "Assinatura atualizada." : "Assinatura cadastrada.");
    resetForm();
    await loadItems();
  }

  async function removeItem(id: string) {
    const confirmed = window.confirm("Deseja excluir esta assinatura?");
    if (!confirmed) return;

    const response = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Erro ao excluir assinatura.");
      return;
    }

    setMessage("Assinatura excluída.");
    await loadItems();
  }

  async function updateStatus(item: SubscriptionDTO, status: SubscriptionStatus) {
    const response = await fetch(`/api/subscriptions/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Erro ao alterar status.");
      return;
    }

    await loadItems();
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Assinaturas</h1>
          <p>Controle Netflix, Spotify, ChatGPT, Crunchyroll e outras plataformas.</p>
        </div>
      </header>

      <section className="grid cards">
        <SummaryCard title="Total mensal ativo" value={formatCurrency(totals.activeTotal)} />
        <SummaryCard title="Total anual estimado" value={formatCurrency(totals.annualTotal)} tone="warning" />
        <SummaryCard title="Assinaturas ativas" value={String(totals.activeCount)} />
      </section>

      <section className="form-card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="section-header">
            <h2>{editingId ? "Editar assinatura" : "Nova assinatura"}</h2>
            {editingId ? (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancelar edição
              </button>
            ) : null}
          </div>

          {error ? <div className="alert">{error}</div> : null}
          {message ? <div className="alert success">{message}</div> : null}

          <div className="form-grid">
            <div className="field">
              <label>Nome da plataforma</label>
              <div className="platform-input">
                <SubscriptionLogo name={form.platformName || "App"} />
                <input
                  className="input"
                  placeholder="Netflix, Spotify, ChatGPT..."
                  value={form.platformName}
                  onChange={(event) => setForm({ ...form, platformName: event.target.value })}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Valor mensal</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.monthlyValue}
                onChange={(event) => setForm({ ...form, monthlyValue: event.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Dia de vencimento</label>
              <input
                className="input"
                type="number"
                min="1"
                max="31"
                value={form.dueDay}
                onChange={(event) => setForm({ ...form, dueDay: event.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Status</label>
              <select
                className="select"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as SubscriptionStatus })}
              >
                <option value="ACTIVE">Ativa</option>
                <option value="PAUSED">Pausada</option>
                <option value="CANCELED">Cancelada</option>
              </select>
            </div>

            <div className="field">
              <label>Categoria</label>
              <input
                className="input"
                placeholder="Streaming, Música, IA, Jogos..."
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                required
              />
            </div>

            <div className="field full">
              <label>Observações</label>
              <textarea
                className="textarea"
                placeholder="Plano, login compartilhado, lembretes..."
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar assinatura"}
            </button>
          </div>
        </form>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Lista de assinaturas</h2>
          <div className="toolbar">
            <label className="filter-control">
              <span>Status</span>
              <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">Todos os status</option>
                <option value="ACTIVE">Ativas</option>
                <option value="PAUSED">Pausadas</option>
                <option value="CANCELED">Canceladas</option>
              </select>
            </label>

            <label className="filter-control">
              <span>Categoria</span>
              <select
                className="select"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="ALL">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">Carregando assinaturas...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">Nenhuma assinatura cadastrada.</div>
          ) : (
            <table className="data-table subscriptions-table">
              <thead>
                <tr>
                  <th>Plataforma</th>
                  <th>Valor</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th>Categoria</th>
                  <th>Observações</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="subscription-cell">
                        <SubscriptionLogo name={item.platformName} />
                        <div>
                          <strong>{item.platformName}</strong>
                          <span>{item.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>{formatCurrency(item.monthlyValue)}</td>
                    <td>Dia {item.dueDay}</td>
                    <td>
                      <Badge tone={item.status}>{subscriptionStatusLabel[item.status]}</Badge>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.notes || <span className="muted-cell">Não informado</span>}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" onClick={() => startEdit(item)} type="button">
                          Editar
                        </button>
                        {item.status !== "ACTIVE" ? (
                          <button className="btn btn-ghost" onClick={() => updateStatus(item, "ACTIVE")} type="button">
                            Ativar
                          </button>
                        ) : null}
                        {item.status !== "PAUSED" ? (
                          <button className="btn btn-ghost" onClick={() => updateStatus(item, "PAUSED")} type="button">
                            Pausar
                          </button>
                        ) : null}
                        {item.status !== "CANCELED" ? (
                          <button className="btn btn-ghost" onClick={() => updateStatus(item, "CANCELED")} type="button">
                            Cancelar
                          </button>
                        ) : null}
                        <button className="btn btn-danger" onClick={() => removeItem(item.id)} type="button">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
