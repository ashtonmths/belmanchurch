ALTER TABLE "Gallery" ADD COLUMN "eventId" text;--> statement-breakpoint
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_eventId_Event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
UPDATE "Gallery" AS gallery
SET "eventId" = event.id
FROM "Event" AS event
WHERE LOWER(TRIM(gallery."eventName")) = LOWER(TRIM(event.name))
	AND DATE(gallery."eventDate") = DATE(event.date)
	AND gallery."eventId" IS NULL;--> statement-breakpoint
UPDATE "Gallery" AS gallery
SET "eventId" = event.id
FROM "Event" AS event
WHERE DATE(gallery."eventDate") = DATE(event.date)
	AND gallery."eventId" IS NULL
	AND (
		SELECT COUNT(*) FROM "Event" AS matching_event
		WHERE DATE(matching_event.date) = DATE(gallery."eventDate")
	) = 1
	AND (
		SELECT COUNT(*) FROM "Gallery" AS matching_gallery
		WHERE DATE(matching_gallery."eventDate") = DATE(gallery."eventDate")
	) = 1;
