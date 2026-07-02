import { NextResponse } from "next/server";

export function unauthorizedResponse() {
  return NextResponse.json({ message: "Usuário não autenticado." }, { status: 401 });
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function notFoundResponse(message = "Registro não encontrado.") {
  return NextResponse.json({ message }, { status: 404 });
}

export function serverErrorResponse(error: unknown) {
  console.error(error);
  return NextResponse.json(
    { message: "Ocorreu um erro interno. Tente novamente." },
    { status: 500 }
  );
}
