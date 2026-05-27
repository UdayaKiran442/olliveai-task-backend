CREATE TABLE "message_metadata" (
	"metadata_id" varchar PRIMARY KEY NOT NULL,
	"message_id" varchar NOT NULL,
	"chat_id" varchar NOT NULL,
	"prompt" varchar NOT NULL,
	"response" varchar NOT NULL,
	"tokens" integer NOT NULL,
	"provider" varchar NOT NULL,
	"model" varchar NOT NULL,
	"request_id" varchar NOT NULL,
	"timestamp" timestamp NOT NULL
);
