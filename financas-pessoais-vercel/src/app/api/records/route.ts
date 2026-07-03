import { NextRequest, NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/http";
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const records = await prisma.financialRecord.findMany({
      where: {
        userId,
        ...(type && type !== "ALL" ? { type: toRecordType(type) } : {}),
        ...(status && status !== "ALL" ? { status: toRecordStatus(status) } : {})
      },
      orderBy: [{ status: "asc" }, { date: "asc" }, { personOrCompany: "asc" }]
    });

    return NextResponse.json({ records: records.map(serializeFinancialRecord) });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const body = await request.json();
    const type = toRecordType(body.type);
    const personOrCompany = readRequiredString(body.personOrCompany, "Pessoa ou empresa");
    const amount = readMoney(body.amount, "Valor");
    const date = readDate(body.date);
    const description = readRequiredString(body.description, "Descrição");
    const status = toRecordStatus(body.status);

    const record = await prisma.financialRecord.create({
      data: {
        userId,
        type,
        personOrCompany,
        amount,
        date,
        description,
        status
      }
    });

    return NextResponse.json({ record: serializeFinancialRecord(record) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return badRequestResponse(error.message);
    }

    return serverErrorResponse(error);
  }
}
