ALTER TABLE "Gallery" ADD COLUMN "thumbnailUrl" text;
--> statement-breakpoint
UPDATE "Gallery" AS gallery
SET "thumbnailUrl" = first_image.url
FROM (
	SELECT DISTINCT ON ("galleryId") "galleryId", url
	FROM "GalleryImage"
	ORDER BY "galleryId", "createdAt" ASC, id ASC
) AS first_image
WHERE first_image."galleryId" = gallery.id
	AND gallery."thumbnailUrl" IS NULL;
