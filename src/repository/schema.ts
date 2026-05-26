import { index, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

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
