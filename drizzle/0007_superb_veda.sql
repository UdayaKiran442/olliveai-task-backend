DROP INDEX "chat_id_index";--> statement-breakpoint
ALTER TABLE "message_metadata" ADD COLUMN "latency" numeric;--> statement-breakpoint
ALTER TABLE "message_metadata" ADD COLUMN "status" varchar;--> statement-breakpoint
CREATE INDEX "message_id_metadata_index" ON "message_metadata" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "user_id_metadata_index" ON "message_metadata" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_id_metadata_index" ON "message_metadata" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "chat_id_messages_index" ON "messages" USING btree ("chat_id");