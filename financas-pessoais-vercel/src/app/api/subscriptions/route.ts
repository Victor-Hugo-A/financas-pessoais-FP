import { NextRequest, NextResponse } from "next/server";
import {
  createDemoSubscription,
  isDemoMode,
  listDemoSubscriptions
} from "@/lib/demo";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeSubscription } from "@/lib/serializers";
import { getCurrentUserId } from "@/lib/session";
import {
  readDueDay,
  readMoney,
  readOptionalString,
  readRequiredString,
  toSubscriptionStatus
} from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    if (isDemoMode()) {
      return NextResponse.json({ subscriptions: listDemoSubscriptions(status, category) });
    }

    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        ...(status && status !== "ALL" ? { status: toSubscriptionStatus(status) } : {}),
        ...(category && category !== "ALL" ? { category } : {})
      },
      orderBy: [{ status: "asc" }, { dueDay: "asc" }, { platformName: "asc" }]
    });

    return NextResponse.json({ subscriptions: subscriptions.map(serializeSubscription) });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isDemoMode()) {
      const body = await request.json();
      return NextResponse.json({ subscription: createDemoSubscription(body) }, { status: 201 });
    }

    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const body = await request.json();
    const platformName = readRequiredString(body.platformName, "Nome da plataforma");
    const monthlyValue = readMoney(body.monthlyValue, "Valor mensal");
    const dueDay = readDueDay(body.dueDay);
    const status = toSubscriptionStatus(body.status);
    const category = readRequiredString(body.category, "Categoria");
    const notes = readOptionalString(body.notes);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        platformName,
        monthlyValue,
        dueDay,
        status,
        category,
        notes
      }
    });

    return NextResponse.json({ subscription: serializeSubscription(subscription) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return badRequestResponse(error.message);
    }

    return serverErrorResponse(error);
  }
}
