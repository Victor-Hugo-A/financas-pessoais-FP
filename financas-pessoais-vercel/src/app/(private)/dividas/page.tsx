"use client";

import { Badge } from "@/components/Badge";
import { SummaryCard } from "@/components/SummaryCard";
import { TimedAlert } from "@/components/TimedAlert";
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
  kind: "SIMPLE" | "INSTALLMENT" | "LOAN";
  personOrCompany: string;
  amount: string;
  originalAmount: string;
  installmentCount: string;
  installmentValue: string;
  paidInstallments: string;
  date: string;
  firstDueDate: string;
  paymentMethod: string;
  description: string;
  status: FinancialRecordStatus;
};

const emptyForm: RecordForm = {
  type: "PAYABLE",
  kind: "SIMPLE",
  personOrCompany: "",
  amount: "",
  originalAmount: "",
  installmentCount: "",
  installmentValue: "",
  paidInstallments: "0",
  date: "",
  firstDueDate: "",
  paymentMethod: "",
  description: "",
  status: "PENDING"
};

export default function RecordsPage() {
  const [items, setItems] = useState<FinancialRecordDTO[]>([]);
  const [form, setForm] = useState<RecordForm>(emptyForm);
  const [amountReduction, setAmountReduction] = useState("");
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

  const isInstallmentOrLoan = form.kind === "INSTALLMENT" || form.kind === "LOAN";

  const suggestedInstallmentValue = useMemo(() => {
    if (!form.isInstallmentOrLoan) return null;

    const baseAmount = parseMoneyInput(form.originalAmount || form.amount);
    const installments = parseIntegerInput(form.installmentCount);

    if (!baseAmount || !installments) return null;

    return Number((baseAmount / installments).toFixed(2));
  }, [form.amount, form.installmentCount, isInstallmentOrLoan, form.originalAmount]);

  function resetForm() {
    setForm(emptyForm);
    setAmountReduction("");
    setEditingId(null);
  }

  function startEdit(item: FinancialRecordDTO) {
    setEditingId(item.id);
    setForm({
      type: item.type,
      personOrCompany: item.personOrCompany,
      amount: String(item.amount),
      isInstallmentPlan: Boolean(item.installmentCount),
      originalAmount: item.originalAmount === null ? "" : String(item.originalAmount),
      installmentCount: item.installmentCount === null ? "" : String(item.installmentCount),
      installmentValue: item.installmentValue === null ? "" : String(item.installmentValue),
      paidInstallments: String(item.paidInstallments),
      date: toDateInputValue(item.date),
      description: item.description,
      status: item.status
    });
    setAmountReduction("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function parseMoneyInput(value: string) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function parseIntegerInput(value: string) {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const isInstallmentOrLoan = form.kind === "INSTALLMENT" || form.kind === "LOAN";

    const payload = {
      ...form,
      isInstallmentPlan: isInstallmentOrLoan,
      originalAmount: isInstallmentOrLoan ? form.originalAmount || form.amount : "",
      installmentCount: isInstallmentOrLoan ? form.installmentCount : "",
      installmentValue: isInstallmentOrLoan ? form.installmentValue : "",
      paidInstallments: isInstallmentOrLoan ? form.paidInstallments || "0" : "0",
      firstDueDate: isInstallmentOrLoan ? form.firstDueDate || form.date : "",
      paymentMethod: isInstallmentOrLoan ? form.paymentMethod : ""
    };

    if (editingId && amountReduction.trim()) {
      const currentAmount = parseMoneyInput(form.amount);
      const reduction = parseMoneyInput(amountReduction);

      if (currentAmount === null || reduction === null || reduction < 0) {
        setSaving(false);
        setError("Informe um valor de abatimento valido.");
        return;
      }

      let nextAmount = Math.max(0, currentAmount - reduction);

      if (form.isInstallmentOrLoan) {
        const installmentCount = parseIntegerInput(form.installmentCount);
        const currentPaidInstallments = parseIntegerInput(form.paidInstallments) ?? 0;
        const originalAmount = parseMoneyInput(form.originalAmount || form.amount);
        const installmentValue =
          parseMoneyInput(form.installmentValue) ??
          (originalAmount && installmentCount ? Number((originalAmount / installmentCount).toFixed(2)) : null);

        if (installmentCount && installmentValue && installmentValue > 0) {
          const paidByReduction = Math.floor((reduction + 0.00001) / installmentValue);
          const nextPaidInstallments = Math.min(installmentCount, currentPaidInstallments + paidByReduction);

          payload.paidInstallments = String(nextPaidInstallments);

          if (nextPaidInstallments >= installmentCount) {
            nextAmount = 0;
          }
        }
      }

      payload.amount = nextAmount.toFixed(2);

      if (nextAmount === 0) {
        if (form.isInstallmentOrLoan && form.installmentCount) {
          payload.paidInstallments = form.installmentCount;
        }

        payload.status = form.type === "PAYABLE" ? "PAID" : "RECEIVED";
      }
    }

    const response = await fetch(editingId ? `/api/records/${editingId}` : "/api/records", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
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

  async function payInstallment(item: FinancialRecordDTO) {
    if (!item.installmentCount || !item.installmentValue) {
      setError("Este registro nao possui parcelas configuradas.");
      return;
    }

    const nextPaidInstallments = Math.min(item.installmentCount, item.paidInstallments + 1);
    const nextAmount =
      nextPaidInstallments >= item.installmentCount
        ? 0
        : Math.max(0, Number((item.amount - item.installmentValue).toFixed(2)));
    const status =
      nextAmount === 0 ? (item.type === "PAYABLE" ? "PAID" : "RECEIVED") : item.status;

    const response = await fetch(`/api/records/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...item,
        amount: nextAmount.toFixed(2),
        paidInstallments: nextPaidInstallments,
        date: toDateInputValue(item.date),
        isInstallmentPlan: true,
        status
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Erro ao abater parcela.");
      return;
    }

    setMessage("Parcela abatida.");
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

          {error ? <TimedAlert message={error} variant="error" onDismiss={() => setError("")} /> : null}
          {message ? <TimedAlert message={message} variant="success" onDismiss={() => setMessage("")} /> : null}

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
              <label>{isInstallmentOrLoan ? (editingId ? "Saldo atual" : "Valor total") : editingId ? "Valor atual" : "Valor"}</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) => {
                  const amount = event.target.value;
                  setForm({
                    ...form,
                    amount,
                    originalAmount: !editingId && form.isInstallmentOrLoan ? amount : form.originalAmount
                  });
                }}
                required
              />
            </div>

            <div className="field">
              <label>Tipo de registro</label>
              <select
                  className="select"
                  value={form.kind}
                  onChange={(event) =>
                      setForm({
                        ...form,
                        kind: event.target.value as "SIMPLE" | "INSTALLMENT" | "LOAN",
                        installmentCount: "",
                        installmentValue: "",
                        paidInstallments: "0",
                        firstDueDate: "",
                        paymentMethod: ""
                      })
                  }
              >
                <option value="SIMPLE">Dívida simples</option>
                <option value="INSTALLMENT">Compra parcelada</option>
                <option value="LOAN">Empréstimo</option>
              </select>
            </div>

            {isInstallmentOrLoan ? (
                <>
                  <div className="field">
                    <label>Data inicial da cobrança</label>
                    <input
                        className="input"
                        type="date"
                        value={form.firstDueDate}
                        onChange={(event) => setForm({ ...form, firstDueDate: event.target.value })}
                        required
                    />
                  </div>

                  <div className="field">
                    <label>Cartão ou forma de pagamento</label>
                    <input
                        className="input"
                        value={form.paymentMethod}
                        onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
                        placeholder="Ex.: Nubank, Inter, Pix, boleto..."
                    />
                  </div>

                  <div className="field">
                    <label>Quantidade de parcelas</label>
                    <input
                        className="input"
                        type="number"
                        min="1"
                        value={form.installmentCount}
                        onChange={(event) => setForm({ ...form, installmentCount: event.target.value })}
                        required
                    />
                  </div>

                  <div className="field">
                    <label>Valor da parcela</label>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.installmentValue}
                        onChange={(event) => setForm({ ...form, installmentValue: event.target.value })}
                        placeholder={
                          suggestedInstallmentValue
                              ? `Ex.: ${formatCurrency(suggestedInstallmentValue)}`
                              : "Calculado automaticamente"
                        }
                    />
                  </div>

                  <div className="field">
                    <label>Parcelas pagas</label>
                    <input
                        className="input"
                        type="number"
                        min="0"
                        max={form.installmentCount || undefined}
                        value={form.paidInstallments}
                        onChange={(event) => setForm({ ...form, paidInstallments: event.target.value })}
                    />
                  </div>
                </>
            ) : null}

            {editingId ? (
              <div className="field">
                <label>Abater valor</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountReduction}
                  onChange={(event) => setAmountReduction(event.target.value)}
                />
              </div>
            ) : null}

            <div className="field">
              <label>Data</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
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
            <label className="filter-control">
              <span>Tipo</span>
              <select className="select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="ALL">Todos os tipos</option>
                <option value="RECEIVABLE">A receber</option>
                <option value="PAYABLE">A pagar</option>
              </select>
            </label>

            <label className="filter-control">
              <span>Status</span>
              <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">Todos os status</option>
                <option value="PENDING">Pendentes</option>
                <option value="PAID">Pagos</option>
                <option value="RECEIVED">Recebidos</option>
              </select>
            </label>
          </div>
        </div>

        <div className="table-wrap">
          {loading ? (
            <div className="empty-state">Carregando registros...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">Nenhum registro cadastrado.</div>
          ) : (
            <table className="data-table records-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Pessoa/empresa</th>
                  <th>Saldo</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th>Parcelas</th>
                  <th>Parcela</th>
                  <th>Descrição</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{recordTypeLabel[item.type]}</td>
                    <td>{item.personOrCompany}</td>
                    <td>
                      <div className="cell-stack">
                        <strong>{formatCurrency(item.amount)}</strong>
                        {item.originalAmount ? <span>Original {formatCurrency(item.originalAmount)}</span> : null}
                      </div>
                    </td>
                    <td>{formatDateBR(item.date)}</td>
                    <td>
                      <Badge tone={item.status}>{recordStatusLabel[item.status]}</Badge>
                    </td>
                    <td>
                      {item.installmentCount ? (
                        `${item.paidInstallments}/${item.installmentCount}`
                      ) : (
                        <span className="muted-cell">Não parcelado</span>
                      )}
                    </td>
                    <td>
                      {item.installmentValue ? (
                        formatCurrency(item.installmentValue)
                      ) : (
                        <span className="muted-cell">Não informado</span>
                      )}
                    </td>
                    <td>{item.description || <span className="muted-cell">Não informado</span>}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" onClick={() => startEdit(item)} type="button">
                          Editar
                        </button>
                        {item.status === "PENDING" && item.installmentCount && item.installmentValue ? (
                          <button
                            className="btn btn-ghost"
                            onClick={() => payInstallment(item)}
                            title="Abater uma parcela"
                            type="button"
                          >
                            Abater
                          </button>
                        ) : null}
                        {item.status !== "PAID" && item.type === "PAYABLE" ? (
                          <button
                            className="btn btn-ghost"
                            onClick={() => updateStatus(item, "PAID")}
                            title="Marcar como pago"
                            type="button"
                          >
                            Quitar
                          </button>
                        ) : null}
                        {item.status !== "RECEIVED" && item.type === "RECEIVABLE" ? (
                          <button
                            className="btn btn-ghost"
                            onClick={() => updateStatus(item, "RECEIVED")}
                            title="Marcar como recebido"
                            type="button"
                          >
                            Receber
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
