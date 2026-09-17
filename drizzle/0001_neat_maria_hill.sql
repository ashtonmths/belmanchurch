CREATE TYPE "public"."PriestRole" AS ENUM('PARISH_PRIEST', 'ASSISTANT_PRIEST');--> statement-breakpoint
CREATE TABLE "Priest" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" "PriestRole" NOT NULL,
	"period" text NOT NULL,
	"imageUrl" text,
	"isCurrent" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) DEFAULT now() NOT NULL
);
