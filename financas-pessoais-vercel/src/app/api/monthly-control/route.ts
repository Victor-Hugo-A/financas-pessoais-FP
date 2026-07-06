import { NextRequest, NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { readMoney } from "@/lib/validators";

export const dynamic = "force-dynamic";

function getCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function getMonthRange(month: string) {
    const [year, monthNumber] = month.split("-").map(Number);

    if (!year || !monthNumber || monthNumber < 1 || monthNumber > 12) {
        throw new Error("Mês inválido.");
    }

    const start = new Date(year, monthNumber - 1, 1);
    const end = new Date(year, monthNumber, 0, 23, 59, 59, 999);

    return { year, monthNumber, start, end };
}

function getDueDateForMonth(firstDueDate: Date, year: number, monthNumber: number) {
    const day = firstDueDate.getDate();
    const lastDay = new Date(year, monthNumber, 0).getDate();

    return new Date(year, monthNumber - 1, Math.min(day, lastDay));
}

function getActiveInstallmentInfo(record: {
    firstDueDate: Date | null;
    date: Date | null;
    installmentCount: number | null;
    paidInstallments: number;
}, targetMonth: string) {
    const firstDueDate = record.firstDueDate ?? record.date;

    if (!firstDueDate || !record.installmentCount) {
        return null;
    }

    const [targetYear, targetMonthNumber] = targetMonth.split("-").map(Number);
    const startYear = firstDueDate.getFullYear();
    const startMonthNumber = firstDueDate.getMonth() + 1;

    const monthDifference =
        (targetYear - startYear) * 12 +
        (targetMonthNumber - startMonthNumber);

    const installmentNumber = monthDifference + 1;

    if (installmentNumber < 1 || installmentNumber > record.installmentCount) {
        return null;
    }

    if (installmentNumber <= record.paidInstallments) {
        return null;
    }

    return {
        installmentNumber,
        dueDate: getDueDateForMonth(firstDueDate, targetYear, targetMonthNumber)
    };
}

function toMonthlyItem(record: any, activeInfo: { installmentNumber: number; dueDate: Date } | null) {
    const amount = Number(record.installmentValue ?? record.amount);

    return {
        id: record.id,
        name: record.personOrCompany,
        amount,
        dueDate: activeInfo?.dueDate?.toISOString() ?? record.date?.toISOString() ?? null,
        description: record.description,
        paymentMethod: record.paymentMethod,
        installmentNumber: activeInfo?.installmentNumber ?? null,
        installmentCount: record.installmentCount
    };
}

export async function GET(request: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) return unauthorizedResponse();

        const { searchParams } = new URL(request.url);
        const month = searchParams.get("month") || getCurrentMonth();
        const { year, monthNumber, start, end } = getMonthRange(month);

        const [income, subscriptions, records] = await Promise.all([
            prisma.monthlyIncome.findUnique({
                where: {
                    userId_month: {
                        userId,
                        month
                    }
                }
            }),
            prisma.subscription.findMany({
                where: {
                    userId,
                    status: "ACTIVE"
                },
                orderBy: [{ dueDay: "asc" }, { platformName: "asc" }]
            }),
            prisma.financialRecord.findMany({
                where: {
                    userId,
                    type: "PAYABLE",
                    status: "PENDING"
                },
                orderBy: [{ date: { sort: "asc", nulls: "last" } }, { personOrCompany: "asc" }]
            })
        ]);

        const subscriptionItems = subscriptions.map((subscription) => {
            const lastDay = new Date(year, monthNumber, 0).getDate();
            const dueDate = new Date(year, monthNumber - 1, Math.min(subscription.dueDay, lastDay));

            return {
                id: subscription.id,
                name: subscription.platformName,
                amount: Number(subscription.monthlyValue),
                dueDate: dueDate.toISOString(),
                description: subscription.category,
                paymentMethod: "Assinatura",
                installmentNumber: null,
                installmentCount: null
            };
        });

        const installmentItems = records
            .filter((record) => record.kind === "INSTALLMENT")
            .map((record) => {
                const activeInfo = getActiveInstallmentInfo(record, month);
                return activeInfo ? toMonthlyItem(record, activeInfo) : null;
            })
            .filter(Boolean);

        const loanItems = records
            .filter((record) => record.kind === "LOAN")
            .map((record) => {
                const activeInfo = getActiveInstallmentInfo(record, month);
                return activeInfo ? toMonthlyItem(record, activeInfo) : null;
            })
            .filter(Boolean);

        const simpleDebtItems = records
            .filter((record) => {
                if (record.kind !== "SIMPLE") return false;
                if (!record.date) return false;
                return record.date >= start && record.date <= end;
            })
            .map((record) => toMonthlyItem(record, null));

        const subscriptionTotal = subscriptionItems.reduce((sum, item) => sum + item.amount, 0);
        const installmentTotal = installmentItems.reduce((sum, item: any) => sum + item.amount, 0);
        const loanTotal = loanItems.reduce((sum, item: any) => sum + item.amount, 0);
        const simpleDebtTotal = simpleDebtItems.reduce((sum, item) => sum + item.amount, 0);

        const monthlyIncome = Number(income?.amount ?? 0);
        const totalExpenses = subscriptionTotal + installmentTotal + loanTotal + simpleDebtTotal;
        const remainingBalance = monthlyIncome - totalExpenses;

        return NextResponse.json({
            month,
            income: monthlyIncome,
            subscriptionTotal,
            installmentTotal,
            loanTotal,
            simpleDebtTotal,
            totalExpenses,
            remainingBalance,
            subscriptions: subscriptionItems,
            installments: installmentItems,
            loans: loanItems,
            simpleDebts: simpleDebtItems
        });
    } catch (error) {
        if (error instanceof Error) {
            return badRequestResponse(error.message);
        }

        return serverErrorResponse(error);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) return unauthorizedResponse();

        const body = await request.json();
        const month = String(body.month || getCurrentMonth());
        getMonthRange(month);

        const amount = readMoney(body.income, "Renda mensal");

        const income = await prisma.monthlyIncome.upsert({
            where: {
                userId_month: {
                    userId,
                    month
                }
            },
            update: {
                amount
            },
            create: {
                userId,
                month,
                amount
            }
        });

        return NextResponse.json({
            income: {
                month: income.month,
                amount: Number(income.amount)
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            return badRequestResponse(error.message);
        }

        return serverErrorResponse(error);
    }
}