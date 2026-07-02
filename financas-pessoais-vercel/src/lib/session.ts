import { cookies } from "next/headers";
import { demoUser, isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/jwt";

export async function getCurrentSession() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  return verifySessionToken(token);
}

export async function getCurrentUserId() {
  if (isDemoMode()) return demoUser.id;

  const session = await getCurrentSession();
  return session?.sub ?? null;
}

export async function requireUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return userId;
}

export async function getCurrentUser() {
  if (isDemoMode()) return demoUser;

  const userId = await getCurrentUserId();

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });
}
