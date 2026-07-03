import { NextResponse } from "next/server";
import { serverErrorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

function getNextDueDate(dueDay: number) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const currentMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentCandidate = new Date(
    today.getFullYear(),
    today.getMonth(),
    Math.min(dueDay, currentMonthLastDay)
  );

  if (currentCandidate >= startOfToday) {
    return currentCandidate;
  }

  const nextMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
  return new Date(today.getFullYear(), today.getMonth() + 1, Math.min(dueDay, nextMonthLastDay));
}

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const [subscriptions, records] = await Promise.all([
      prisma.subscription.findMany({ where: { userId } }),
      prisma.financialRecord.findMany({ where: { userId } })
    ]);

    const activeSubscriptions = subscriptions.filter((item) => item.status === "ACTIVE");
    const monthlySubscriptionsTotal = activeSubscriptions.reduce(
      (sum, item) => sum + Number(item.monthlyValue),
      0
    );
    const annualSubscriptionsTotal = monthlySubscriptionsTotal * 12;

    const receivableTotal = records
      .filter((record) => record.type === "RECEIVABLE" && record.status === "PENDING")
      .reduce((sum, record) => sum + Number(record.amount), 0);

    const payableTotal = records
      .filter((record) => record.type === "PAYABLE" && record.status === "PENDING")
      .reduce((sum, record) => sum + Number(record.amount), 0);

    const finalBalance = receivableTotal - payableTotal;

    const upcomingDueDates = activeSubscriptions
      .map((item) => {
        const nextDueDate = getNextDueDate(item.dueDay);
        return {
          id: item.id,
          platformName: item.platformName,
          monthlyValue: Number(item.monthlyValue),
          dueDay: item.dueDay,
          nextDueDate: nextDueDate.toISOString()
        };
      })
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
      .slice(0, 5);

    return NextResponse.json({
      monthlySubscriptionsTotal,
      annualSubscriptionsTotal,
      receivableTotal,
      payableTotal,
      finalBalance,
      activeSubscriptionsCount: activeSubscriptions.length,
      pendingRecordsCount: records.filter((record) => record.status === "PENDING").length,
      upcomingDueDates
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
