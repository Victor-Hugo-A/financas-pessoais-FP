import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { demoUser, isDemoMode } from "@/lib/demo";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { badRequestResponse, serverErrorResponse } from "@/lib/http";
import { normalizeEmail, readRequiredString, validateEmail } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    if (isDemoMode()) {
      const token = await createSessionToken({ sub: demoUser.id, email: demoUser.email, name: demoUser.name });
      const response = NextResponse.json({ user: demoUser });

      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE
      });

      return response;
    }

    const body = await request.json();
    const name = readRequiredString(body.name, "Nome");
    const email = normalizeEmail(body.email);
    const password = readRequiredString(body.password, "Senha");

    if (!validateEmail(email)) {
      return badRequestResponse("Informe um e-mail válido.");
    }

    if (password.length < 6) {
      return badRequestResponse("A senha precisa ter pelo menos 6 caracteres.");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return badRequestResponse("Este e-mail já está cadastrado.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    const token = await createSessionToken({ sub: user.id, email: user.email, name: user.name });
    const response = NextResponse.json({ user });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes("obrigatório")) {
      return badRequestResponse(error.message);
    }

    return serverErrorResponse(error);
  }
}
