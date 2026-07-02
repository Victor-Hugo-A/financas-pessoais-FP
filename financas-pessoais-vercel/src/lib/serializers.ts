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
    date: record.date.toISOString(),
    description: record.description,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}
