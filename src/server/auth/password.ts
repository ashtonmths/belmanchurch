/**
 * Password hashing for the stored admin login. Kept free of Next.js imports so
 * the `admin:login` script can share it.
 */
import { scrypt } from "node:crypto";
import { promisify } from "node:util";
import { z } from "zod";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/**
 * Where the admin login is kept when it isn't set in the environment.
 *
 * Not one of the editable content keys, so the content API can neither read
 * nor overwrite it.
 */
export const ADMIN_LOGIN_KEY = "admin-login";

export const SALT_BYTES = 16;
export const HASH_BYTES = 64;

export const storedLoginSchema = z.object({
  username: z.string().min(3),
  /** Hex-encoded scrypt salt and hash of the password. */
  salt: z.string().regex(new RegExp(`^[0-9a-f]{${SALT_BYTES * 2}}$`)),
  hash: z.string().regex(new RegExp(`^[0-9a-f]{${HASH_BYTES * 2}}$`)),
});

export type StoredLogin = z.infer<typeof storedLoginSchema>;

export function hashPassword(password: string, salt: Buffer) {
  return scryptAsync(password, salt, HASH_BYTES);
}
