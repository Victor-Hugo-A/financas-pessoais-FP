"use client";

import { SummaryCard } from "@/components/SummaryCard";
import { TimedAlert } from "@/components/TimedAlert";
import { formatCurrency, formatDateBR } from "@/lib/format";
import { FormEvent, useEffect, useMemo, useState } from "react";

type MonthlyItem = {
    id: string;
    name: string;
    amount: number;
    dueDate: string | null;
    description?: string | null;
    paymentMethod?: string | null;
    installmentNumber?: number | null;
    installmentCount?: number | null;
};

type MonthlyControlData = {
    month: string;
    income: number;
    subscriptionTotal: number;
    installmentTotal: number;
    loanTotal: number;
    simpleDebtTotal: number;
    totalExpenses: number;
    remainingBalance: number;
    subscriptions: MonthlyItem[];
    installments: MonthlyItem[];
    loans: MonthlyItem[];
    simpleDebts: MonthlyItem[];
};

function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

export default function MonthlyControlPage() {
    const [month, setMonth] = useState(getCurrentMonth());
    const [income, setIncome] = useState("");
    const [data, setData] = useState<MonthlyControlData | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingIncome, setSavingIncome] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    async function loadMonthlyControl(selectedMonth = month) {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/monthly-control?month=${selectedMonth}`, {
            cache: "no-store"
        });

        const result = await response.json();
        setLoading(false);

        if (!response.ok) {
            setError(result.message || "Erro ao carregar controle mensal.");
            return;
        }

        setData(result);
        setIncome(String(result.income || ""));
    }

    useEffect(() => {
        loadMonthlyControl(month);
    }, [month]);

    async function handleSaveIncome(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSavingIncome(true);
        setMessage("");
        setError("");

        const response = await fetch("/api/monthly-control", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                month,
                income
            })
        });

        const result = await response.json();
        setSavingIncome(false);

        if (!response.ok) {
            setError(result.message || "Erro ao salvar renda mensal.");
            return;
        }

        setMessage("Renda mensal salva.");
        await loadMonthlyControl(month);
    }

    const monthLabel = useMemo(() => {
        const [year, monthNumber] = month.split("-");
        return new Intl.DateTimeFormat("pt-BR", {
            month: "long",
            year: "numeric"
        }).format(new Date(Number(year), Number(monthNumber) - 1, 1));
    }, [month]);

    function renderTable(items: MonthlyItem[], emptyMessage: string) {
        if (items.length === 0) {
            return <div className="empty-state">{emptyMessage}</div>;
        }

        return (
            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Valor</th>
                        <th>Vencimento</th>
                        <th>Forma</th>
                        <th>Parcela</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <div className="cell-stack">
                                    <strong>{item.name}</strong>
                                    {item.description ? <span>{item.description}</span> : null}
                                </div>
                            </td>
                            <td>{formatCurrency(item.amount)}</td>
                            <td>{formatDateBR(item.dueDate)}</td>
                            <td>{item.paymentMethod || <span className="muted-cell">Não informado</span>}</td>
                            <td>
                                {item.installmentNumber && item.installmentCount ? (
                                    `${item.installmentNumber}/${item.installmentCount}`
                                ) : (
                                    <span className="muted-cell">-</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <>
            <header className="page-header">
                <div>
                    <h1>Controle mensal</h1>
                    <p>
                        Veja quanto entra, quanto sai e quanto sobra em {monthLabel}.
                    </p>
                </div>

                <label className="filter-control">
                    <span>Mês</span>
                    <input
                        className="input"
                        type="month"
                        value={month}
                        onChange={(event) => setMonth(event.target.value)}
                    />
                </label>
            </header>

            {error ? <TimedAlert message={error} variant="error" onDismiss={() => setError("")} /> : null}
            {message ? <TimedAlert message={message} variant="success" onDismiss={() => setMessage("")} /> : null}

            <section className="form-card">
                <form className="form" onSubmit={handleSaveIncome}>
                    <div className="section-header">
                        <h2>Renda do mês</h2>
                    </div>

                    <div className="form-grid">
                        <div className="field">
                            <label>Quanto você recebe no mês?</label>
                            <input
                                className="input"
                                type="number"
                                min="0"
                                step="0.01"
                                value={income}
                                onChange={(event) => setIncome(event.target.value)}
                                placeholder="Ex.: 3000"
                            />
                        </div>
                    </div>

                    <div className="actions">
                        <button className="btn" type="submit" disabled={savingIncome}>
                            {savingIncome ? "Salvando..." : "Salvar renda"}
                        </button>
                    </div>
                </form>
            </section>

            {loading ? (
                <p className="loading">Carregando controle mensal...</p>
            ) : data ? (
                <>
                    <section className="grid cards">
                        <SummaryCard title="Renda mensal" value={formatCurrency(data.income)} tone="positive" />
                        <SummaryCard title="Assinaturas" value={formatCurrency(data.subscriptionTotal)} />
                        <SummaryCard title="Fatura / parcelas" value={formatCurrency(data.installmentTotal)} tone="warning" />
                        <SummaryCard title="Empréstimos" value={formatCurrency(data.loanTotal)} tone="negative" />
                        <SummaryCard title="Dívidas do mês" value={formatCurrency(data.simpleDebtTotal)} tone="negative" />
                        <SummaryCard title="Total de despesas" value={formatCurrency(data.totalExpenses)} tone="negative" />
                        <SummaryCard
                            title="Sobra no mês"
                            value={formatCurrency(data.remainingBalance)}
                            tone={data.remainingBalance >= 0 ? "positive" : "negative"}
                        />
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <h2>Parcelas ativas no mês</h2>
                        </div>
                        {renderTable(data.installments, "Nenhuma compra parcelada ativa neste mês.")}
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <h2>Empréstimos ativos no mês</h2>
                        </div>
                        {renderTable(data.loans, "Nenhum empréstimo ativo neste mês.")}
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <h2>Assinaturas ativas</h2>
                        </div>
                        {renderTable(data.subscriptions, "Nenhuma assinatura ativa cadastrada.")}
                    </section>

                    <section className="section">
                        <div className="section-header">
                            <h2>Dívidas simples do mês</h2>
                        </div>
                        {renderTable(data.simpleDebts, "Nenhuma dívida simples vencendo neste mês.")}
                    </section>
                </>
            ) : null}
        </>
    );
}