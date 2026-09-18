import path from "node:path";
import { eq } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";
import { db } from "../src/server/db";
import { priests } from "../src/server/db/schema";

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

const records = await db.select().from(priests);
const localImages = new Map(
  records
    .filter((priest) => priest.imageUrl?.startsWith("/priests/"))
    .map((priest) => [priest.imageUrl!, priest.imageUrl!.split("/").at(-1)!]),
);

for (const [localUrl, fileName] of localImages) {
  const result = await cloudinary.uploader.upload(
    path.resolve("public", "priests", fileName),
    {
      folder: "Priests",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    },
  );
  await db
    .update(priests)
    .set({ imageUrl: result.secure_url })
    .where(eq(priests.imageUrl, localUrl));
  console.log(`Uploaded ${fileName}`);
}

console.log(`Updated ${localImages.size} priest portraits.`);
process.exit(0);
