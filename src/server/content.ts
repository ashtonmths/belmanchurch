import "server-only";

import { CONTENT, type ContentKey, type ContentValue } from "~/lib/site-content";
import { db } from "~/server/db";

/**
 * Reads an editable content block. Falls back to the default when the key has
 * never been saved or the stored value no longer matches the schema.
 */
export async function getContent<K extends ContentKey>(key: K): Promise<ContentValue<K>> {
  const row = await db.siteContent.findUnique({ where: { key } });
  if (row) {
    const parsed = CONTENT[key].schema.safeParse(row.value);
    if (parsed.success) return parsed.data as ContentValue<K>;
  }
  return CONTENT[key].default as ContentValue<K>;
}
