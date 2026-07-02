export function normalizeEmail(email: unknown) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function readRequiredString(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} é obrigatório.`);
  }

  return value.trim();
}

export function readOptionalString(value: unknown) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text : null;
}

export function readMoney(value: unknown, fieldName = "Valor") {
  const normalized = typeof value === "string" ? value.replace(",", ".") : value;
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`${fieldName} precisa ser um número válido.`);
  }

  return Number(amount.toFixed(2));
}

export function readDueDay(value: unknown) {
  const dueDay = Number(value);

  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    throw new Error("Dia de vencimento precisa estar entre 1 e 31.");
  }

  return dueDay;
}

export function readDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    throw new Error("Data é obrigatória.");
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Data inválida.");
  }

  return date;
}

export function toSubscriptionStatus(value: unknown) {
  const status = String(value || "ACTIVE").toUpperCase();

  if (!["ACTIVE", "PAUSED", "CANCELED"].includes(status)) {
    throw new Error("Status da assinatura inválido.");
  }

  return status as "ACTIVE" | "PAUSED" | "CANCELED";
}

export function toRecordType(value: unknown) {
  const type = String(value || "RECEIVABLE").toUpperCase();

  if (!["RECEIVABLE", "PAYABLE"].includes(type)) {
    throw new Error("Tipo de registro inválido.");
  }

  return type as "RECEIVABLE" | "PAYABLE";
}

export function toRecordStatus(value: unknown) {
  const status = String(value || "PENDING").toUpperCase();

  if (!["PENDING", "PAID", "RECEIVED"].includes(status)) {
    throw new Error("Status financeiro inválido.");
  }

  return status as "PENDING" | "PAID" | "RECEIVED";
}
