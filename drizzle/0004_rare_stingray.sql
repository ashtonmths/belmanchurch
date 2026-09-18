CREATE TABLE "SiteSettings_new" (
	"key" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "SiteSettings_new" ("key", "enabled", "updatedAt")
SELECT 'DONATIONS_ENABLED', "donationEnabled", "updatedAt" FROM "SiteSettings" WHERE "id" = 'main';
--> statement-breakpoint
INSERT INTO "SiteSettings_new" ("key", "enabled", "updatedAt")
SELECT 'CATECHISM_ENABLED', "catechismEnabled", "updatedAt" FROM "SiteSettings" WHERE "id" = 'main';
--> statement-breakpoint
DROP TABLE "SiteSettings";
--> statement-breakpoint
ALTER TABLE "SiteSettings_new" RENAME TO "SiteSettings";
