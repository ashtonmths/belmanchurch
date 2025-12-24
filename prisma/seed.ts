import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const wards = [
    { name: "Carmel Mai Ward" },
    { name: "Christ King Ward" },
    { name: "Don Bosco Ward" },
    { name: "Fathima Ward" },
    { name: "Holy Cross Ward" },
    { name: "Holy Family Ward" },
    { name: "Immaculate Heart Of Mary Ward" },
    { name: "Infant Jesus Ward" },
    { name: "Lourdes Ward" },
    { name: "Mother Teresa Ward" },
    { name: "Our Lady Of Dolours Ward" },
    { name: "Our Lady Of Rosary Ward" },
    { name: "Sacred Heart Ward" },
    { name: "St. Antony Ward" },
    { name: "St. Francis Xavier Ward" },
    { name: "St. Joseph Ward" },
    { name: "St. Joseph Worker Ward" },
    { name: "St. Lawrence Ward" },
    { name: "St. Michael Ward" },
    { name: "St. Peter Ward" },
    { name: "Velankani Ward" },
    { name: "Nithyadhar Ward" }, // ✅ fixed
  ];

  await prisma.ward.createMany({
    data: wards,
    skipDuplicates: true,
  });

  console.log("✅ Wards seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });