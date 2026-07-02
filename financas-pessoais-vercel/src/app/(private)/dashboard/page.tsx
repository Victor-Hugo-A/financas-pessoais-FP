"use client";

import { SummaryCard } from "@/components/SummaryCard";
import { SubscriptionLogo } from "@/components/SubscriptionLogo";
import { formatCurrency, formatDateBR } from "@/lib/format";
import { useEffect, useState } from "react";

type DashboardData = {
  monthlySubscriptionsTotal: number;
  annualSubscriptionsTotal: number;
  receivableTotal: number;
  payableTotal: number;
  finalBalance: number;
  activeSubscriptionsCount: number;
  pendingRecordsCount: number;
  upcomingDueDates: Array<{
    id: string;
    platformName: string;
    monthlyValue: number;
    dueDay: number;
    nextDueDate: string;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(result.message || "Erro ao carregar dashboard.");
        return;
      }

      setData(result);
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <p className="loading">Carregando dashboard...</p>;
  }

  if (error) {
    return <div className="alert">{error}</div>;
  }

  if (!data) return null;

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Dashboard financeiro</h1>
          <p>Resumo automático das suas assinaturas, valores a pagar e valores a receber.</p>
        </div>
      </header>

      <section className="grid cards">
        <SummaryCard
          title="Assinaturas ativas"
          value={formatCurrency(data.monthlySubscriptionsTotal)}
          caption={`${data.activeSubscriptionsCount} assinatura(s) ativa(s)`}
        />
        <SummaryCard
          title="Gasto anual estimado"
          value={formatCurrency(data.annualSubscriptionsTotal)}
          caption="Com base nas assinaturas ativas"
          tone="warning"
        />
        <SummaryCard
          title="Total a receber"
          value={formatCurrency(data.receivableTotal)}
          caption="Somente pendentes"
          tone="positive"
        />
        <SummaryCard
          title="Total a pagar"
          value={formatCurrency(data.payableTotal)}
          caption="Somente pendentes"
          tone="negative"
        />
        <SummaryCard
          title="Saldo final"
          value={formatCurrency(data.finalBalance)}
          caption="A receber menos a pagar"
          tone={data.finalBalance >= 0 ? "positive" : "negative"}
        />
        <SummaryCard
          title="Registros pendentes"
          value={String(data.pendingRecordsCount)}
          caption="Dívidas e recebimentos em aberto"
        />
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Próximos vencimentos</h2>
        </div>

        <div className="table-wrap">
          {data.upcomingDueDates.length === 0 ? (
            <div className="empty-state">Nenhuma assinatura ativa cadastrada.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Plataforma</th>
                  <th>Valor</th>
                  <th>Dia</th>
                  <th>Próximo vencimento</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingDueDates.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="subscription-cell">
                        <SubscriptionLogo name={item.platformName} />
                        <strong>{item.platformName}</strong>
                      </div>
                    </td>
                    <td>{formatCurrency(item.monthlyValue)}</td>
                    <td>{item.dueDay}</td>
                    <td>{formatDateBR(item.nextDueDate)}</td>
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
