import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { readRequiredString } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) return unauthorizedResponse();

    const body = await request.json();
    const password = readRequiredString(body.password, "Senha");

    if (password.length < 6) {
      return badRequestResponse("A senha precisa ter pelo menos 6 caracteres.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return badRequestResponse(error.message);
    }

    return serverErrorResponse(error);
  }
}
