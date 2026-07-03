import type { FinancialRecord, Subscription } from "@prisma/client";

export function serializeSubscription(subscription: Subscription) {
  return {
    id: subscription.id,
    platformName: subscription.platformName,
    monthlyValue: Number(subscription.monthlyValue),
    dueDay: subscription.dueDay,
    status: subscription.status,
    category: subscription.category,
    notes: subscription.notes,
    createdAt: subscription.createdAt.toISOString(),
    updatedAt: subscription.updatedAt.toISOString()
  };
}

export function serializeFinancialRecord(record: FinancialRecord) {
  return {
    id: record.id,
    type: record.type,
    personOrCompany: record.personOrCompany,
    amount: Number(record.amount),
    originalAmount: record.originalAmount === null ? null : Number(record.originalAmount),
    installmentCount: record.installmentCount,
    installmentValue: record.installmentValue === null ? null : Number(record.installmentValue),
    paidInstallments: record.paidInstallments,
    date: record.date?.toISOString() ?? null,
    description: record.description,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}
