import { NextRequest, NextResponse } from "next/server";
import { badRequestResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { serializeFinancialRecord } from "@/lib/serializers";
import { getCurrentUserId } from "@/lib/session";
import {
  readDate,
  readMoney,
  readRequiredString,
  toRecordStatus,
  toRecordType
} from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const exists = await prisma.financialRecord.findFirst({
      where: { id: params.id, userId }
    });

    if (!exists) return notFoundResponse();

    const body = await request.json();
    const record = await prisma.financialRecord.update({
      where: { id: params.id },
      data: {
        type: toRecordType(body.type),
        personOrCompany: readRequiredString(body.personOrCompany, "Pessoa ou empresa"),
        amount: readMoney(body.amount, "Valor"),
        date: readDate(body.date),
        description: readRequiredString(body.description, "Descrição"),
        status: toRecordStatus(body.status)
      }
    });

    return NextResponse.json({ record: serializeFinancialRecord(record) });
  } catch (error) {
    if (error instanceof Error) {
      return badRequestResponse(error.message);
    }

    return serverErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const exists = await prisma.financialRecord.findFirst({
      where: { id: params.id, userId }
    });

    if (!exists) return notFoundResponse();

    await prisma.financialRecord.delete({ where: { id: params.id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
