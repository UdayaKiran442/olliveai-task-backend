CREATE TABLE "chat" (
	"chat_id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
