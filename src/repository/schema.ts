import { index, integer, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	userId: varchar("user_id").primaryKey(),
	email: varchar("email").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const chat = pgTable("chat", {
	chatId: varchar("chat_id").primaryKey(),
	userId: varchar("user_id").notNull(),
	name: varchar("name"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const messages = pgTable(
	"messages",
	{
		messageId: varchar("message_id").primaryKey(),
		chatId: varchar("chat_id").notNull(),
		query: varchar("query").notNull(),
		response: varchar("response").notNull(),
		model: varchar("model").notNull(),
		provider: varchar("provider").notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	(messages) => ({
		chatIdIndex: index("chat_id_index").on(messages.chatId),
	}),
);

export const messageMetadata = pgTable("message_metadata", {
	metadataId: varchar("metadata_id").primaryKey(),
	messageId: varchar("message_id").notNull(),
	chatId: varchar("chat_id").notNull(),
	prompt: varchar("prompt").notNull(),
	userId: varchar("user_id").notNull(),
	response: varchar("response").notNull(),
	tokens: integer("tokens").notNull(),
	provider: varchar("provider").notNull(),
	model: varchar("model").notNull(),
	requestId: varchar("request_id").notNull(),
	timestamp: timestamp("timestamp").notNull(),
}, (messageMetadata) => ({
	messageIdIndex: uniqueIndex("message_id_index").on(messageMetadata.messageId),
	userIdIndex: index("user_id_index").on(messageMetadata.userId),
	chatIdIndex: index("chat_id_index").on(messageMetadata.chatId),
}));
