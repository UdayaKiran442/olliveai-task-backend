import { nanoid } from "nanoid";
import db from "./db";
import { messages } from "./schema";
import { AddChatMessagesToDBError, GetChatMessagesFromDBError } from "../exceptions/message.exceptions";
import { eq } from "drizzle-orm";

export async function addChatMessagesToDB(payload: { chatId: string; query: string; response: string; model: string; provider: string }) {
	try {
		const insertPayload = {
			messageId: `message_${nanoid()}`,
			chatId: payload.chatId,
			query: payload.query,
			response: payload.response,
			model: payload.model,
			provider: payload.provider,
			createdAt: new Date(),
		};
		await db.insert(messages).values(insertPayload);
        return insertPayload;
	} catch (error) {
		throw new AddChatMessagesToDBError("Failed to add chat messages to DB", { cause: (error as Error).message });
	}
}

export async function getChatMessagesFromDB(chatId: string) {
	try {
		return await db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(messages.createdAt);
	} catch (error) {
		throw new GetChatMessagesFromDBError("Failed to get chat messages from DB", { cause: (error as Error).message });
	}
}