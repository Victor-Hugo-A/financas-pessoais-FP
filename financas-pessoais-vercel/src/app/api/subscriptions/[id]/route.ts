import { NextRequest, NextResponse } from "next/server";
import {
  deleteDemoSubscription,
  isDemoMode,
  updateDemoSubscription
} from "@/lib/demo";
import { badRequestResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/http";
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (isDemoMode()) {
      const body = await request.json();
      const subscription = updateDemoSubscription(params.id, body);

      if (!subscription) return notFoundResponse();

      return NextResponse.json({ subscription });
    }

    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const exists = await prisma.subscription.findFirst({
      where: { id: params.id, userId }
    });

    if (!exists) return notFoundResponse();

    const body = await request.json();
    const subscription = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        platformName: readRequiredString(body.platformName, "Nome da plataforma"),
        monthlyValue: readMoney(body.monthlyValue, "Valor mensal"),
        dueDay: readDueDay(body.dueDay),
        status: toSubscriptionStatus(body.status),
        category: readRequiredString(body.category, "Categoria"),
        notes: readOptionalString(body.notes)
      }
    });

    return NextResponse.json({ subscription: serializeSubscription(subscription) });
  } catch (error) {
    if (error instanceof Error) {
      return badRequestResponse(error.message);
    }

    return serverErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (isDemoMode()) {
      if (!deleteDemoSubscription(params.id)) return notFoundResponse();
      return NextResponse.json({ ok: true });
    }

    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const exists = await prisma.subscription.findFirst({
      where: { id: params.id, userId }
    });

    if (!exists) return notFoundResponse();

    await prisma.subscription.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
