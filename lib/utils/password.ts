import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const N = 16384;
const r = 8;
const p = 1;
const keyLen = 64;
const saltLen = 16;

/**
 * Hash a password using scrypt.
 * Format: scrypt$N=16384,r=8,p=1$salt$hash
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(saltLen).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, keyLen, { N, r, p })) as Buffer;
  return `scrypt$N=${N},r=${r},p=${p}$${salt}$${derivedKey.toString("hex")}`;
}

/**
 * Verify a password against a hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const parts = hash.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") {
    throw new Error("Invalid hash format");
  }

  const paramsStr = parts[1];
  const salt = parts[2];
  const storedHash = Buffer.from(parts[3], "hex");

  const params: Record<string, number> = {};
  paramsStr.split(",").forEach((param) => {
    const [key, value] = param.split("=");
    params[key] = parseInt(value, 10);
  });

  const derivedKey = (await scryptAsync(password, salt, storedHash.length, {
    N: params.N,
    r: params.r,
    p: params.p,
  })) as Buffer;

  return timingSafeEqual(storedHash, derivedKey);
}
