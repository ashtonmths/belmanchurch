/**
 * Sets the admin panel login without touching the hosting settings.
 *
 *   npm run admin:login            prints SQL to paste into the Supabase SQL Editor
 *   npm run admin:login -- --apply writes it to the database in DATABASE_URL
 *
 * Only a salted hash of the password is stored. ADMIN_USERNAME and
 * ADMIN_PASSWORD in the environment, when set, still take precedence.
 */
import { randomBytes } from "node:crypto";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import { PrismaClient } from "@prisma/client";
import {
  ADMIN_LOGIN_KEY,
  SALT_BYTES,
  hashPassword,
  storedLoginSchema,
  type StoredLogin,
} from "../src/server/auth/password";

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  if (hidden) {
    // Echo nothing while the password is typed.
    const write = (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput;
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s) => {
      if (s.startsWith(question)) write.call(rl, s);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) stdout.write("\n");
      resolve(answer);
    }),
  );
}

async function main() {
  const username = (await ask("Admin username: ")).trim();
  if (username.length < 3) throw new Error("Use a username of at least 3 characters.");

  const password = await ask("New password (hidden): ", true);
  if (password.length < 12) throw new Error("Use a password of at least 12 characters.");
  if ((await ask("Type it again: ", true)) !== password) throw new Error("The passwords didn't match.");

  const salt = randomBytes(SALT_BYTES);
  const login: StoredLogin = storedLoginSchema.parse({
    username,
    salt: salt.toString("hex"),
    hash: (await hashPassword(password, salt)).toString("hex"),
  });

  if (process.argv.includes("--apply")) {
    const db = new PrismaClient();
    try {
      await db.siteContent.upsert({
        where: { key: ADMIN_LOGIN_KEY },
        update: { value: login },
        create: { key: ADMIN_LOGIN_KEY, value: login },
      });
    } finally {
      await db.$disconnect();
    }
    console.log(`\nSaved. Sign in at /admin/login as "${username}".`);
    return;
  }

  const json = JSON.stringify(login).replaceAll("'", "''");
  console.log("\nPaste this into the Supabase SQL Editor and click Run:\n");
  console.log(
    `insert into "SiteContent" ("key", "value", "updatedAt") values ('${ADMIN_LOGIN_KEY}', '${json}'::jsonb, now())\n` +
      `on conflict ("key") do update set "value" = excluded."value", "updatedAt" = now();\n`,
  );
  console.log("It holds only a salted hash; the password itself is not in it.");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
