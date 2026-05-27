import { nanoid } from "nanoid";
import db from "./db";
import { messages } from "./schema";
import { AddChatMessagesToDBError } from "../exceptions/message.exceptions";

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
