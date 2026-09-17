CREATE TABLE "MassSchedule" (
	"id" text PRIMARY KEY NOT NULL,
	"dayOfWeek" integer NOT NULL,
	"label" text NOT NULL,
	"hour" integer NOT NULL,
	"minute" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sortOrder" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "MassSchedule" ("id", "dayOfWeek", "label", "hour", "minute", "sortOrder") VALUES
('mass-monday', 1, 'Weekday Mass', 6, 30, 0),
('mass-tuesday', 2, 'Weekday Mass', 6, 30, 0),
('mass-wednesday', 3, 'Weekday Mass', 6, 30, 0),
('mass-thursday', 4, 'Weekday Mass', 6, 30, 0),
('mass-friday', 5, 'Weekday Mass', 6, 30, 0),
('mass-saturday', 6, 'Evening Mass', 16, 0, 0),
('mass-sunday-morning', 0, 'Morning Mass', 7, 30, 0),
('mass-sunday-late', 0, 'After catechism', 10, 30, 1);
