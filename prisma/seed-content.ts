/**
 * One-time setup for the admin-managed content: priests and homepage carousel.
 *
 * Safe to run more than once — each table is only filled when it is empty, so
 * nothing an admin has entered is ever overwritten.
 *
 *   npm run db:seed:content
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient, type PriestRole } from "@prisma/client";

const db = new PrismaClient();

/** Keep a photo only if the file is actually in /public. */
const photo = (file?: string) =>
  file && existsSync(path.join(process.cwd(), "public", file)) ? file : null;

type Row = [name: string, period: string, image?: string];

// Parish priests, per the parish history (Wikipedia: "St. Joseph Church, Belman").
const PARISH_PRIESTS: Row[] = [
  ["Rev. Fr. Nicholas Carneiro", "1894 to 1903"],
  ["Rev. Fr. Rosario P. B. Lewis", "1903 to 1906"],
  ["Rev. Fr. Emmanuel Vas", "1906 to 1910"],
  ["Rev. Fr. Peter R. D'Souza", "1910 to 1913"],
  ["Rev. Fr. Anthony A. E. Colaco", "1913 to 1914", "/priests/anthonyC.jpg"],
  ["Rev. Fr. Denis R. Lewis", "1914 to 1934", "/priests/denisRlewis.jpg"],
  ["Rev. Fr. P. L. Botelho", "1934 to 1957", "/priests/bothelo.jpg"],
  ["Rev. Fr. Nicholas J. Pereira", "1957 to 1973", "/priests/nicholas.jpg"],
  ["Rev. Fr. Aloysius Rodrigues", "1973 to 1978", "/priests/aloysiusR.jpg"],
  ["Rev. Fr. Lawrence Gomes", "1978 to 1986", "/priests/lawrenceG.jpg"],
  ["Rev. Fr. John Fernandes", "1986 to 1994", "/priests/johnF.jpg"],
  ["Rev. Fr. Thomas D'Souza", "1994 to 2001", "/priests/thomasD.jpg"],
  ["Rev. Fr. Lawrence Rodrigues", "2002 to 2009", "/priests/lawrenceR.jpg"],
  ["Rev. Fr. Lawrence B. D'Souza", "2009 to 2016", "/priests/lawrenceD.jpg"],
  ["Rev. Fr. Sunil Veigas", "2016 to 2017", "/priests/sunilV.jpg"],
  ["Rev. Fr. Edwin D'Souza", "2017 to 2022", "/priests/edwinD.jpg"],
  ["Rev. Fr. Frederick Mascarenhas", "2022 to present", "/priests/frederickM.jpg"],
];

const ASSISTANT_PRIESTS: Row[] = [
  ["Rev. Fr. Norbert D'Souza", "1954 to 1957", "/priests/norbertD.png"],
  ["Rev. Fr. Walter D'Mello", "1984 to 1987", "/priests/walterD.jpg"],
  ["Rev. Fr. Gerald D'Souza", "1987 to 1988", "/priests/geraldD.png"],
  ["Rev. Fr. Peter D'Souza", "1992 to 1993", "/priests/peterD.jpg"],
  ["Rev. Fr. Sylvester D'Costa", "1993 to 1995", "/priests/sylvesterD.jpg"],
  ["Rev. Fr. Michael Santhumayor", "1995 to 1997"],
  ["Rev. Fr. Dolphy Monteiro", "1997 to 1998"],
  ["Rev. Fr. Jerome D'Souza", "1998 to 2001", "/priests/jeromeD.png"],
  ["Rev. Fr. Jerome Lawrence Mascarenhas", "2001 to 2002", "/priests/jeromeLM.jpg"],
  ["Rev. Fr. Pascal Menezes", "2002 to 2003"],
  ["Rev. Fr. Praveen Amrith Martis", "2003 to 2005", "/priests/praveenAM.jpg"],
  ["Rev. Fr. Vijay Lobo", "2005 to 2007"],
  ["Rev. Fr. Rocky Ravi Fernandes", "2007 to 2009", "/priests/rockRF.jpg"],
  ["Rev. Fr. Edwin D'Souza", "2009 to 2010", "/priests/edwinD.jpg"],
  ["Rev. Fr. Melwyn Lobo", "2010 to 2011"],
  ["Rev. Fr. Ronald Pinto", "2011 to 2012", "/priests/ronaldP.jpg"],
  ["Rev. Fr. John Baptist Moras", "2014 to 2016", "/priests/JBmoras.jpg"],
  ["Rev. Fr. Joswin Praveen D'Souza", "2016 to 2017", "/priests/joswinPD.jpg"],
  ["Rev. Fr. Melwyl Roy Lobo", "2017 to 2018", "/priests/melwynRL.jpg"],
  ["Rev. Fr. Prakash Menezes OP", "2018 to 2019"],
  ["Rev. Fr. Ivan Martis", "2020 to 2021", "/priests/ivanM.png"],
  ["Rev. Fr. Anson D'Souza SVD", "2021 to 2022"],
  ["Rev. Fr. Ankith D'Souza", "2022 to 2023"],
  ["Rev. Fr. Arnold Mathias SDB", "2023 to 2025", "/priests/arnoldM.png"],
  ["Rev. Fr. Oswald Vaz", "2025 to present", "/priests/oswaldV.png"],
];

// Titles are used as the photo's alt text and to label the slide in the admin.
const SLIDES = [
  { imageUrl: "/carousel/facade.jpg", title: "St. Joseph Church on its hillock at Belman" },
  { imageUrl: "/carousel/nave.jpg", title: "The parish gathered for Sunday Mass" },
  { imageUrl: "/carousel/benediction.jpg", title: "Benediction at the high altar" },
  { imageUrl: "/carousel/hill-procession.jpg", title: "The Way of the Cross on Tingal hill" },
  { imageUrl: "/carousel/feast-altar.jpg", title: "The altar dressed for a feast" },
];

function rows(list: Row[], role: PriestRole) {
  return list.map(([name, period, image], order) => ({
    name,
    period,
    role,
    order,
    imageUrl: photo(image),
    // The last entry in each list is the priest serving now.
    isCurrent: order === list.length - 1,
  }));
}

async function main() {
  if ((await db.priest.count()) === 0) {
    const data = [
      ...rows(PARISH_PRIESTS, "PARISH_PRIEST"),
      ...rows(ASSISTANT_PRIESTS, "ASSISTANT_PRIEST"),
    ];
    await db.priest.createMany({ data });
    const missing = data.filter((p) => !p.imageUrl).length;
    console.log(`Added ${data.length} priests (${missing} without a photo yet).`);
  } else {
    console.log("Priests already set up — skipped.");
  }

  if ((await db.carouselSlide.count()) === 0) {
    await db.carouselSlide.createMany({
      data: SLIDES.filter((s) => photo(s.imageUrl)).map((s, order) => ({ ...s, order })),
    });
    console.log(`Added ${SLIDES.length} carousel slides.`);
  } else {
    console.log("Carousel already set up — skipped.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
