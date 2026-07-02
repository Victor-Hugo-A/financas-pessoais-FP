import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE_NAME = "financas_session";
const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 20) {
    throw new Error("JWT_SECRET precisa estar configurado com uma chave segura.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${DEFAULT_EXPIRES_IN_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (!payload.sub || typeof payload.sub !== "string") {
      return null;
    }

    return {
      sub: payload.sub,
      email: typeof payload.email === "string" ? payload.email : "",
      name: typeof payload.name === "string" ? payload.name : ""
    };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = DEFAULT_EXPIRES_IN_SECONDS;
