-- Belman Church: database update for the new website.
--
-- Run once in the Supabase SQL Editor, BEFORE the new code is merged to main.
-- Everything runs in one transaction: if any line fails, nothing is changed.
--
-- Only adds things. No existing table, column or row is altered or removed,
-- so donations, families, users, events and the gallery are untouched.
-- Existing events get an empty photo list.

begin;

-- CreateEnum
CREATE TYPE "PriestRole" AS ENUM ('PARISH_PRIEST', 'ASSISTANT_PRIEST');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "CarouselSlide" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarouselSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Priest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "PriestRole" NOT NULL,
    "period" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Priest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("key")
);

-- Priests (42): parish priests and assistant parish priests.
insert into "Priest" ("id", "name", "role", "period", "imageUrl", "isCurrent", "order", "updatedAt") values
  (gen_random_uuid()::text, 'Rev. Fr. Nicholas Carneiro', 'PARISH_PRIEST', '1894 to 1903', null, false, 0, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Rosario P. B. Lewis', 'PARISH_PRIEST', '1903 to 1906', null, false, 1, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Emmanuel Vas', 'PARISH_PRIEST', '1906 to 1910', null, false, 2, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Peter R. D''Souza', 'PARISH_PRIEST', '1910 to 1913', null, false, 3, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Anthony A. E. Colaco', 'PARISH_PRIEST', '1913 to 1914', '/priests/anthonyC.jpg', false, 4, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Denis R. Lewis', 'PARISH_PRIEST', '1914 to 1934', '/priests/denisRlewis.jpg', false, 5, now()),
  (gen_random_uuid()::text, 'Rev. Fr. P. L. Botelho', 'PARISH_PRIEST', '1934 to 1957', '/priests/bothelo.jpg', false, 6, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Nicholas J. Pereira', 'PARISH_PRIEST', '1957 to 1973', '/priests/nicholas.jpg', false, 7, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Aloysius Rodrigues', 'PARISH_PRIEST', '1973 to 1978', '/priests/aloysiusR.jpg', false, 8, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Lawrence Gomes', 'PARISH_PRIEST', '1978 to 1986', '/priests/lawrenceG.jpg', false, 9, now()),
  (gen_random_uuid()::text, 'Rev. Fr. John Fernandes', 'PARISH_PRIEST', '1986 to 1994', '/priests/johnF.jpg', false, 10, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Thomas D''Souza', 'PARISH_PRIEST', '1994 to 2001', '/priests/thomasD.jpg', false, 11, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Lawrence Rodrigues', 'PARISH_PRIEST', '2002 to 2009', '/priests/lawrenceR.jpg', false, 12, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Lawrence B. D''Souza', 'PARISH_PRIEST', '2009 to 2016', '/priests/lawrenceD.jpg', false, 13, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Sunil Veigas', 'PARISH_PRIEST', '2016 to 2017', '/priests/sunilV.jpg', false, 14, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Edwin D''Souza', 'PARISH_PRIEST', '2017 to 2022', '/priests/edwinD.jpg', false, 15, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Frederick Mascarenhas', 'PARISH_PRIEST', '2022 to present', '/priests/frederickM.jpg', true, 16, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Norbert D''Souza', 'ASSISTANT_PRIEST', '1954 to 1957', '/priests/norbertD.png', false, 0, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Walter D''Mello', 'ASSISTANT_PRIEST', '1984 to 1987', '/priests/walterD.jpg', false, 1, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Gerald D''Souza', 'ASSISTANT_PRIEST', '1987 to 1988', '/priests/geraldD.png', false, 2, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Peter D''Souza', 'ASSISTANT_PRIEST', '1992 to 1993', '/priests/peterD.jpg', false, 3, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Sylvester D''Costa', 'ASSISTANT_PRIEST', '1993 to 1995', '/priests/sylvesterD.jpg', false, 4, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Michael Santhumayor', 'ASSISTANT_PRIEST', '1995 to 1997', null, false, 5, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Dolphy Monteiro', 'ASSISTANT_PRIEST', '1997 to 1998', null, false, 6, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Jerome D''Souza', 'ASSISTANT_PRIEST', '1998 to 2001', '/priests/jeromeD.png', false, 7, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Jerome Lawrence Mascarenhas', 'ASSISTANT_PRIEST', '2001 to 2002', '/priests/jeromeLM.jpg', false, 8, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Pascal Menezes', 'ASSISTANT_PRIEST', '2002 to 2003', null, false, 9, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Praveen Amrith Martis', 'ASSISTANT_PRIEST', '2003 to 2005', '/priests/praveenAM.jpg', false, 10, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Vijay Lobo', 'ASSISTANT_PRIEST', '2005 to 2007', null, false, 11, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Rocky Ravi Fernandes', 'ASSISTANT_PRIEST', '2007 to 2009', '/priests/rockRF.jpg', false, 12, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Edwin D''Souza', 'ASSISTANT_PRIEST', '2009 to 2010', '/priests/edwinD.jpg', false, 13, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Melwyn Lobo', 'ASSISTANT_PRIEST', '2010 to 2011', null, false, 14, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Ronald Pinto', 'ASSISTANT_PRIEST', '2011 to 2012', '/priests/ronaldP.jpg', false, 15, now()),
  (gen_random_uuid()::text, 'Rev. Fr. John Baptist Moras', 'ASSISTANT_PRIEST', '2014 to 2016', '/priests/JBmoras.jpg', false, 16, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Joswin Praveen D''Souza', 'ASSISTANT_PRIEST', '2016 to 2017', '/priests/joswinPD.jpg', false, 17, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Melwyl Roy Lobo', 'ASSISTANT_PRIEST', '2017 to 2018', '/priests/melwynRL.jpg', false, 18, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Prakash Menezes OP', 'ASSISTANT_PRIEST', '2018 to 2019', null, false, 19, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Ivan Martis', 'ASSISTANT_PRIEST', '2020 to 2021', '/priests/ivanM.png', false, 20, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Anson D''Souza SVD', 'ASSISTANT_PRIEST', '2021 to 2022', null, false, 21, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Ankith D''Souza', 'ASSISTANT_PRIEST', '2022 to 2023', null, false, 22, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Arnold Mathias SDB', 'ASSISTANT_PRIEST', '2023 to 2025', '/priests/arnoldM.png', false, 23, now()),
  (gen_random_uuid()::text, 'Rev. Fr. Oswald Vaz', 'ASSISTANT_PRIEST', '2025 to present', '/priests/oswaldV.png', true, 24, now());

-- Homepage carousel (5 photos, shipped with the site in /public/carousel).
insert into "CarouselSlide" ("id", "imageUrl", "title", "order") values
  (gen_random_uuid()::text, '/carousel/facade.jpg', 'St. Joseph Church on its hillock at Belman', 0),
  (gen_random_uuid()::text, '/carousel/nave.jpg', 'The parish gathered for Sunday Mass', 1),
  (gen_random_uuid()::text, '/carousel/benediction.jpg', 'Benediction at the high altar', 2),
  (gen_random_uuid()::text, '/carousel/hill-procession.jpg', 'The Way of the Cross on Tingal hill', 3),
  (gen_random_uuid()::text, '/carousel/feast-altar.jpg', 'The altar dressed for a feast', 4);

-- Homepage photo tint (changeable later under Admin > Homepage carousel).
insert into "SiteContent" ("key", "value", "updatedAt") values
  ('heroTint', '{"color":"#765827","strength":20}'::jsonb, now());

commit;

-- Check: should list 5 new tables, 42 priests and 5 slides.
select
  (select count(*) from information_schema.tables
     where table_schema = 'public'
     and table_name in ('CarouselSlide', 'Priest', 'Notification', 'ContactMessage', 'SiteContent')) as new_tables,
  (select count(*) from "Priest") as priests,
  (select count(*) from "CarouselSlide") as slides,
  (select count(*) from "Event") as events_kept;
