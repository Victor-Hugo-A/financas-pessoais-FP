import type {
  FinancialRecordDTO,
  FinancialRecordStatus,
  FinancialRecordType,
  SubscriptionDTO,
  SubscriptionStatus
} from "@/types/app";

export const demoUser = {
  id: "demo-user",
  name: "Usuário Demo",
  email: "demo@local.test",
  createdAt: new Date("2026-01-01T12:00:00.000Z")
};

export function isDemoMode() {
  return process.env.DEMO_MODE === "true";
}

const now = new Date().toISOString();

let subscriptions: SubscriptionDTO[] = [
  {
    id: "sub-netflix",
    platformName: "Netflix",
    monthlyValue: 39.9,
    dueDay: 8,
    status: "ACTIVE",
    category: "Streaming",
    notes: "Plano padrão",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "sub-spotify",
    platformName: "Spotify",
    monthlyValue: 21.9,
    dueDay: 15,
    status: "ACTIVE",
    category: "Música",
    notes: "Individual",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "sub-chatgpt",
    platformName: "ChatGPT",
    monthlyValue: 110,
    dueDay: 22,
    status: "PAUSED",
    category: "IA",
    notes: "Assinatura pausada para teste",
    createdAt: now,
    updatedAt: now
  }
];

let records: FinancialRecordDTO[] = [
  {
    id: "record-salario-extra",
    type: "RECEIVABLE",
    personOrCompany: "Cliente freelance",
    amount: 850,
    date: new Date("2026-07-10T12:00:00.000Z").toISOString(),
    description: "Pagamento de projeto",
    status: "PENDING",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "record-internet",
    type: "PAYABLE",
    personOrCompany: "Internet",
    amount: 119.9,
    date: new Date("2026-07-05T12:00:00.000Z").toISOString(),
    description: "Conta mensal",
    status: "PENDING",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "record-cartao",
    type: "PAYABLE",
    personOrCompany: "Cartão de crédito",
    amount: 420.35,
    date: new Date("2026-07-12T12:00:00.000Z").toISOString(),
    description: "Fatura parcial",
    status: "PAID",
    createdAt: now,
    updatedAt: now
  }
];

function nextDueDate(dueDay: number) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const lastDayThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentCandidate = new Date(today.getFullYear(), today.getMonth(), Math.min(dueDay, lastDayThisMonth));

  if (currentCandidate >= startOfToday) {
    return currentCandidate;
  }

  const lastDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
  return new Date(today.getFullYear(), today.getMonth() + 1, Math.min(dueDay, lastDayNextMonth));
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toMoney(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toDate(value: unknown) {
  const parsed = typeof value === "string" ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function getDemoDashboard() {
  const activeSubscriptions = subscriptions.filter((item) => item.status === "ACTIVE");
  const monthlySubscriptionsTotal = activeSubscriptions.reduce((sum, item) => sum + item.monthlyValue, 0);
  const annualSubscriptionsTotal = monthlySubscriptionsTotal * 12;
  const receivableTotal = records
    .filter((record) => record.type === "RECEIVABLE" && record.status === "PENDING")
    .reduce((sum, record) => sum + record.amount, 0);
  const payableTotal = records
    .filter((record) => record.type === "PAYABLE" && record.status === "PENDING")
    .reduce((sum, record) => sum + record.amount, 0);

  return {
    monthlySubscriptionsTotal,
    annualSubscriptionsTotal,
    receivableTotal,
    payableTotal,
    finalBalance: receivableTotal - payableTotal,
    activeSubscriptionsCount: activeSubscriptions.length,
    pendingRecordsCount: records.filter((record) => record.status === "PENDING").length,
    upcomingDueDates: activeSubscriptions
      .map((item) => ({
        id: item.id,
        platformName: item.platformName,
        monthlyValue: item.monthlyValue,
        dueDay: item.dueDay,
        nextDueDate: nextDueDate(item.dueDay).toISOString()
      }))
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
      .slice(0, 5)
  };
}

export function listDemoSubscriptions(status?: string | null, category?: string | null) {
  return subscriptions
    .filter((item) => !status || status === "ALL" || item.status === status)
    .filter((item) => !category || category === "ALL" || item.category === category)
    .sort((a, b) => a.status.localeCompare(b.status) || a.dueDay - b.dueDay || a.platformName.localeCompare(b.platformName));
}

export function createDemoSubscription(body: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const subscription: SubscriptionDTO = {
    id: makeId("sub"),
    platformName: String(body.platformName || "Nova assinatura"),
    monthlyValue: toMoney(body.monthlyValue),
    dueDay: Number(body.dueDay || 1),
    status: (body.status as SubscriptionStatus) || "ACTIVE",
    category: String(body.category || "Geral"),
    notes: body.notes ? String(body.notes) : null,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  subscriptions = [...subscriptions, subscription];
  return subscription;
}

export function updateDemoSubscription(id: string, body: Record<string, unknown>) {
  let updated: SubscriptionDTO | null = null;
  subscriptions = subscriptions.map((item) => {
    if (item.id !== id) return item;

    updated = {
      ...item,
      platformName: String(body.platformName || item.platformName),
      monthlyValue: body.monthlyValue === undefined ? item.monthlyValue : toMoney(body.monthlyValue),
      dueDay: body.dueDay === undefined ? item.dueDay : Number(body.dueDay),
      status: (body.status as SubscriptionStatus) || item.status,
      category: String(body.category || item.category),
      notes: body.notes === undefined ? item.notes : body.notes ? String(body.notes) : null,
      updatedAt: new Date().toISOString()
    };
    return updated;
  });

  return updated;
}

export function deleteDemoSubscription(id: string) {
  const initialLength = subscriptions.length;
  subscriptions = subscriptions.filter((item) => item.id !== id);
  return subscriptions.length !== initialLength;
}

export function listDemoRecords(type?: string | null, status?: string | null) {
  return records
    .filter((item) => !type || type === "ALL" || item.type === type)
    .filter((item) => !status || status === "ALL" || item.status === status)
    .sort(
      (a, b) =>
        a.status.localeCompare(b.status) ||
        new Date(a.date).getTime() - new Date(b.date).getTime() ||
        a.personOrCompany.localeCompare(b.personOrCompany)
    );
}

export function createDemoRecord(body: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const record: FinancialRecordDTO = {
    id: makeId("record"),
    type: (body.type as FinancialRecordType) || "RECEIVABLE",
    personOrCompany: String(body.personOrCompany || "Pessoa ou empresa"),
    amount: toMoney(body.amount),
    date: toDate(body.date),
    description: String(body.description || "Registro de demonstração"),
    status: (body.status as FinancialRecordStatus) || "PENDING",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  records = [...records, record];
  return record;
}

export function updateDemoRecord(id: string, body: Record<string, unknown>) {
  let updated: FinancialRecordDTO | null = null;
  records = records.map((item) => {
    if (item.id !== id) return item;

    updated = {
      ...item,
      type: (body.type as FinancialRecordType) || item.type,
      personOrCompany: String(body.personOrCompany || item.personOrCompany),
      amount: body.amount === undefined ? item.amount : toMoney(body.amount),
      date: body.date === undefined ? item.date : toDate(body.date),
      description: String(body.description || item.description),
      status: (body.status as FinancialRecordStatus) || item.status,
      updatedAt: new Date().toISOString()
    };
    return updated;
  });

  return updated;
}

export function deleteDemoRecord(id: string) {
  const initialLength = records.length;
  records = records.filter((item) => item.id !== id);
  return records.length !== initialLength;
}
