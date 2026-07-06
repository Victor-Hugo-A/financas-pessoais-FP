import {
  readMoney,
  readOptionalDate,
  readOptionalMoney,
  readOptionalNonNegativeInteger,
  readOptionalPositiveInteger,
  readOptionalString,
  readRequiredString,
  toRecordStatus,
  toRecordType,
  toRecordKind
} from "@/lib/validators";

function hasValue(value: unknown) {
  return value !== null && value !== undefined && value !== "";
}

export function readFinancialRecordInput(body: Record<string, unknown>) {
  const type = toRecordType(body.type);
  const personOrCompany = readRequiredString(body.personOrCompany, "Pessoa ou empresa");
  const amount = readMoney(body.amount, "Valor");
  const date = readOptionalDate(body.date);
  const description = readOptionalString(body.description) ?? "Não informado";
  const status = toRecordStatus(body.status);
  const kind = toRecordKind(body.kind);
  const paymentMethod = readOptionalString(body.paymentMethod);
  const firstDueDate = readOptionalDate(body.firstDueDate);

  const explicitInstallmentChoice =
    typeof body.isInstallmentPlan === "boolean" ? body.isInstallmentPlan : null;
  const hasInstallmentFields =
    hasValue(body.originalAmount) || hasValue(body.installmentCount) || hasValue(body.installmentValue);
  const isInstallmentPlan = kind === "INSTALLMENT" || kind === "LOAN";

  if (!isInstallmentPlan) {
    return {
      type,
      personOrCompany,
      amount,
      originalAmount: null,
      installmentCount: null,
      installmentValue: null,
      paidInstallments: 0,
      date,
      description,
      status
    };
  }

  const originalAmount = readOptionalMoney(body.originalAmount, "Valor original") ?? amount;
  const installmentCount = readOptionalPositiveInteger(body.installmentCount, "Quantidade de parcelas");
  const providedInstallmentValue = readOptionalMoney(body.installmentValue, "Valor da parcela");
  const paidInstallments =
    readOptionalNonNegativeInteger(body.paidInstallments, "Parcelas pagas") ?? 0;

  if (originalAmount <= 0) {
    throw new Error("Valor original precisa ser maior que zero.");
  }

  if (!installmentCount) {
    throw new Error("Informe a quantidade de parcelas.");
  }

  if (paidInstallments > installmentCount) {
    throw new Error("Parcelas pagas não pode ser maior que a quantidade de parcelas.");
  }

  const installmentValue = providedInstallmentValue ?? Number((originalAmount / installmentCount).toFixed(2));

  if (installmentValue <= 0) {
    throw new Error("Valor da parcela precisa ser maior que zero.");
  }

  return {
    type,
    personOrCompany,
    amount,
    originalAmount,
    installmentCount,
    installmentValue,
    paidInstallments,
    date,
    description,
    status,
    kind,
    paymentMethod,
    firstDueDate
  };
}
