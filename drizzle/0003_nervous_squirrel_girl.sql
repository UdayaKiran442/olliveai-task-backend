CREATE TABLE "messages" (
	"message_id" varchar PRIMARY KEY NOT NULL,
	"chat_id" varchar NOT NULL,
	"query" varchar NOT NULL,
	"response" varchar NOT NULL,
	"model" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE INDEX "chat_id_index" ON "messages" USING btree ("chat_id");