import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { auth } from "~/server/auth";

/**
 * Local-development upload endpoint: saves files into public/uploads.
 *
 * In production uploads go straight from the browser to Cloudinary (see
 * src/lib/upload.ts), because Vercel rejects request bodies over 4.5 MB.
 */
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};
const MAX_BYTES = 40 * 1024 * 1024;

export async function POST(request: Request) {
  if (env.UPLOAD_STORAGE !== "local") {
    return NextResponse.json({ error: "Local uploads are disabled" }, { status: 404 });
  }

  const session = await auth();
  const role = session?.user?.role;
  if (!role || !["ADMIN", "DEVELOPER", "PHOTOGRAPHER"].includes(role)) {
    return NextResponse.json({ error: "Not signed in as admin" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: `Unsupported type ${file.type}` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const rawFolder = form.get("folder");
  const folder =
    (typeof rawFolder === "string" ? rawFolder : "misc")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "misc";

  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${folder}/${name}` });
}
