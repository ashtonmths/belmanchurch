CREATE TABLE "SiteSettings" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"donationEnabled" boolean DEFAULT true NOT NULL,
	"catechismEnabled" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "MassSchedule" ADD COLUMN "scheduleType" text DEFAULT 'WEEKDAY' NOT NULL;
--> statement-breakpoint
DELETE FROM "MassSchedule" WHERE "id" IN ('mass-tuesday', 'mass-wednesday', 'mass-thursday', 'mass-friday');
--> statement-breakpoint
UPDATE "MassSchedule" SET "label" = 'Weekday Mass', "scheduleType" = 'WEEKDAY', "dayOfWeek" = 1 WHERE "id" = 'mass-monday';
UPDATE "MassSchedule" SET "scheduleType" = 'SATURDAY' WHERE "id" = 'mass-saturday';
UPDATE "MassSchedule" SET "scheduleType" = 'SUNDAY_ALWAYS' WHERE "id" = 'mass-sunday-morning';
UPDATE "MassSchedule" SET "scheduleType" = 'SUNDAY_CATECHISM' WHERE "id" = 'mass-sunday-late';
INSERT INTO "MassSchedule" ("id", "dayOfWeek", "scheduleType", "label", "hour", "minute", "sortOrder")
VALUES ('mass-sunday-no-catechism', 0, 'SUNDAY_NO_CATECHISM', 'Sunday Mass without catechism', 10, 0, 2);
--> statement-breakpoint
INSERT INTO "SiteSettings" ("id", "donationEnabled", "catechismEnabled") VALUES ('main', true, true)
ON CONFLICT ("id") DO NOTHING;
