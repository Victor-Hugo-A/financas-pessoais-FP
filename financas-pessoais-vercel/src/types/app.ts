export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELED";
export type FinancialRecordType = "RECEIVABLE" | "PAYABLE";
export type FinancialRecordStatus = "PENDING" | "PAID" | "RECEIVED";
export type FinancialRecordKind = "SIMPLE" | "INSTALLMENT" | "LOAN";

export type SubscriptionDTO = {
  id: string;
  platformName: string;
  monthlyValue: number;
  dueDay: number;
  status: SubscriptionStatus;
  category: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FinancialRecordDTO = {
  id: string;
  type: FinancialRecordType;
  kind: FinancialRecordKind;
  personOrCompany: string;
  amount: number;
  originalAmount: number | null;
  installmentCount: number | null;
  installmentValue: number | null;
  paidInstallments: number;
  date: string | null;
  firstDueDate: string | null;
  paymentMethod: string | null;
  description: string;
  status: FinancialRecordStatus;
  createdAt: string;
  updatedAt: string;
};

export const recordKindLabel: Record<FinancialRecordKind, string> = {
  SIMPLE: "Dívida simples",
  INSTALLMENT: "Compra parcelada",
  LOAN: "Empréstimo"
};

export const subscriptionStatusLabel: Record<SubscriptionStatus, string> = {
  ACTIVE: "Ativa",
  PAUSED: "Pausada",
  CANCELED: "Cancelada"
};

export const recordTypeLabel: Record<FinancialRecordType, string> = {
  RECEIVABLE: "A receber",
  PAYABLE: "A pagar"
};

export const recordStatusLabel: Record<FinancialRecordStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  RECEIVED: "Recebido"
};
