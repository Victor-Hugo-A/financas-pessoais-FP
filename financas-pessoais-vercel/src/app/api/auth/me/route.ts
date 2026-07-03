import { NextResponse } from "next/server";
import { unauthorizedResponse, serverErrorResponse } from "@/lib/http";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    return NextResponse.json({ user });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
