import { NextRequest, NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/http";
import { readFinancialRecordInput } from "@/lib/financial-records";
import { prisma } from "@/lib/prisma";
import { serializeFinancialRecord } from "@/lib/serializers";
import { getCurrentUserId } from "@/lib/session";
import { toRecordStatus, toRecordType } from "@/lib/validators";

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
      orderBy: [{ status: "asc" }, { date: { sort: "asc", nulls: "last" } }, { personOrCompany: "asc" }]
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
    const data = readFinancialRecordInput(body);

    const record = await prisma.financialRecord.create({
      data: {
        userId,
        ...data
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
