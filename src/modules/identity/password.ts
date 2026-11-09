import { randomBytes, scrypt, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("base64url");
  const derived = (await scryptAsync(password, salt, 32)) as Buffer;
  return `scrypt$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [kind, salt, hash] = stored.split("$");
  if (kind !== "scrypt" || !salt || !hash) {
    return false;
  }
  const derived = (await scryptAsync(password, salt, 32)) as Buffer;
  const expected = Buffer.from(hash, "base64url");
  if (derived.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(derived, expected);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

export function createToken(): string {
  return randomBytes(32).toString("base64url");
}
