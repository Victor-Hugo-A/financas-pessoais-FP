"use client";

import { Badge } from "@/components/Badge";
import { SummaryCard } from "@/components/SummaryCard";
import { formatCurrency, formatDateBR, toDateInputValue } from "@/lib/format";
import {
  FinancialRecordDTO,
  FinancialRecordStatus,
  FinancialRecordType,
  recordStatusLabel,
  recordTypeLabel
} from "@/types/app";
import { FormEvent, useEffect, useMemo, useState } from "react";

type RecordForm = {
  type: FinancialRecordType;
  personOrCompany: string;
  amount: string;
  date: string;
  description: string;
  status: FinancialRecordStatus;
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm: RecordForm = {
  type: "RECEIVABLE",
  personOrCompany: "",
  amount: "",
  date: today,
  description: "",
  status: "PENDING"
};

export default function RecordsPage() {
  const [items, setItems] = useState<FinancialRecordDTO[]>([]);
  const [form, setForm] = useState<RecordForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadItems() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("type", typeFilter);
    params.set("status", statusFilter);

    const response = await fetch(`/api/records?${params.toString()}`, { cache: "no-store" });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.message || "Erro ao carregar registros.");
      return;
    }

    setItems(data.records);
  }

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  const totals = useMemo(() => {
    const receivableTotal = items
      .filter((item) => item.type === "RECEIVABLE" && item.status === "PENDING")
      .reduce((sum, item) => sum + item.amount, 0);
    const payableTotal = items
      .filter((item) => item.type === "PAYABLE" && item.status === "PENDING")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      receivableTotal,
      payableTotal,
      finalBalance: receivableTotal - payableTotal
    };
  }, [items]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(item: FinancialRecordDTO) {
    setEditingId(item.id);
    setForm({
      type: item.type,
      personOrCompany: item.personOrCompany,
      amount: String(item.amount),
      date: toDateInputValue(item.date),
      description: item.description,
      status: item.status
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const response = await fetch(editingId ? `/api/records/${editingId}` : "/api/records", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.message || "Erro ao salvar registro.");
      return;
    }

    setMessage(editingId ? "Registro atualizado." : "Registro cadastrado.");
    resetForm();
    await loadItems();
  }

  async function removeItem(id: string) {
    const confirmed = window.confirm("Deseja excluir este registro?");
    if (!confirmed) return;

    const response = await fetch(`/api/records/${id}`, { method: "DELETE" });
    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Erro ao excluir registro.");
      return;
    }

    setMessage("Registro excluído.");
    await loadItems();
  }

  async function updateStatus(item: FinancialRecordDTO, status: FinancialRecordStatus) {
    const response = await fetch(`/api/records/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, date: toDateInputValue(item.date), status })
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
          <h1>Dívidas e valores</h1>
          <p>Registre quem te deve, quem você deve e acompanhe o saldo pendente.</p>
        </div>
      </header>

      <section className="grid cards">
        <SummaryCard title="Total a receber" value={formatCurrency(totals.receivableTotal)} tone="positive" />
        <SummaryCard title="Total a pagar" value={formatCurrency(totals.payableTotal)} tone="negative" />
        <SummaryCard
          title="Saldo final"
          value={formatCurrency(totals.finalBalance)}
          tone={totals.finalBalance >= 0 ? "positive" : "negative"}
        />
      </section>

      <section className="form-card">
        <form className="form" onSubmit={handleSubmit}>
          <div className="section-header">
            <h2>{editingId ? "Editar registro" : "Novo registro"}</h2>
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
              <label>Tipo</label>
              <select
                className="select"
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value as FinancialRecordType })}
              >
                <option value="RECEIVABLE">Estão me devendo</option>
                <option value="PAYABLE">Estou devendo</option>
              </select>
            </div>

            <div className="field">
              <label>Pessoa ou empresa</label>
              <input
                className="input"
                value={form.personOrCompany}
                onChange={(event) => setForm({ ...form, personOrCompany: event.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Valor</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Data</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Status</label>
              <select
                className="select"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value as FinancialRecordStatus })}
              >
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
                <option value="RECEIVED">Recebido</option>
              </select>
            </div>

            <div className="field full">
              <label>Descrição</label>
              <textarea
                className="textarea"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Ex.: emprestei dinheiro, dividi compra, conta da internet..."
                required
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar registro"}
            </button>
          </div>
        </form>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Registros financeiros</h2>
          <div className="toolbar">
            <select className="select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="ALL">Todos os tipos</option>
              <option value="RECEIVABLE">A receber</option>
              <option value="PAYABLE">A pagar</option>
            </select>

            <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">Todos os status</option>
              <option value="PENDING">Pendentes</option>
              <option value="PAID">Pagos</option>
              <option value="RECEIVED">Recebidos</option>
            </select>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">Carregando registros...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">Nenhum registro cadastrado.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Pessoa/empresa</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{recordTypeLabel[item.type]}</td>
                    <td>{item.personOrCompany}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{formatDateBR(item.date)}</td>
                    <td>
                      <Badge tone={item.status}>{recordStatusLabel[item.status]}</Badge>
                    </td>
                    <td>{item.description}</td>
                    <td>
                      <div className="actions">
                        <button className="btn btn-secondary" onClick={() => startEdit(item)} type="button">
                          Editar
                        </button>
                        {item.status !== "PAID" && item.type === "PAYABLE" ? (
                          <button className="btn btn-ghost" onClick={() => updateStatus(item, "PAID")} type="button">
                            Marcar pago
                          </button>
                        ) : null}
                        {item.status !== "RECEIVED" && item.type === "RECEIVABLE" ? (
                          <button className="btn btn-ghost" onClick={() => updateStatus(item, "RECEIVED")} type="button">
                            Marcar recebido
                          </button>
                        ) : null}
                        {item.status !== "PENDING" ? (
                          <button className="btn btn-ghost" onClick={() => updateStatus(item, "PENDING")} type="button">
                            Reabrir
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
