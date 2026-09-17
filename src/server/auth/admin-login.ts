import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { ADMIN_LOGIN_KEY, hashPassword, storedLoginSchema } from "~/server/auth/password";
import { db } from "~/server/db";

/** Constant-time comparison, so response timing can't reveal a partial match. */
function sameText(a: string, b: string) {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

/**
 * Checks a username and password against the admin login.
 *
 * ADMIN_USERNAME and ADMIN_PASSWORD in the environment take precedence;
 * otherwise the hashed login stored in the database (set with
 * `npm run admin:login`) is used. Returns false when neither exists, which
 * leaves username/password sign-in switched off.
 */
export async function checkAdminLogin(username: string, password: string) {
  const envUser = process.env.ADMIN_USERNAME;
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envUser && envPassword) {
    // Evaluate both so a wrong username and a wrong password take equal time.
    const userOk = sameText(username, envUser);
    const passwordOk = sameText(password, envPassword);
    return userOk && passwordOk;
  }

  const row = await db.siteContent.findUnique({ where: { key: ADMIN_LOGIN_KEY } });
  const stored = storedLoginSchema.safeParse(row?.value);
  if (!stored.success) return false;

  const userOk = sameText(username, stored.data.username);
  const actual = await hashPassword(password, Buffer.from(stored.data.salt, "hex"));
  const passwordOk = timingSafeEqual(actual, Buffer.from(stored.data.hash, "hex"));
  return userOk && passwordOk;
}
