import { db } from "../src/server/db";
import { wards } from "../src/server/db/schema";

const wardNames = [
  "Carmel Mai Ward",
  "Christ King Ward",
  "Don Bosco Ward",
  "Fathima Ward",
  "Holy Cross Ward",
  "Holy Family Ward",
  "Immaculate Heart Of Mary Ward",
  "Infant Jesus Ward",
  "Lourdes Ward",
  "Mother Teresa Ward",
  "Our Lady Of Dolours Ward",
  "Our Lady Of Rosary Ward",
  "Sacred Heart Ward",
  "St. Antony Ward",
  "St. Francis Xavier Ward",
  "St. Joseph Ward",
  "St. Joseph Worker Ward",
  "St. Lawrence Ward",
  "St. Michael Ward",
  "St. Peter Ward",
  "Velankani Ward",
  "Nithyadhar Ward",
];

await db
  .insert(wards)
  .values(wardNames.map((name) => ({ name })))
  .onConflictDoNothing({ target: wards.name });

console.log("Wards seeded successfully");
process.exit(0);
