import { nanoid } from "nanoid";
import db from "./db";
import { chat } from "./schema";
import { CreateChatInDBError, GetChatByIdFromDBError } from "../exceptions/chat.exceptions";
import { eq } from "drizzle-orm";

export async function createChatInDB(payload: { userId: string }) {
	try {
		const insertPayload = {
			chatId: `chat_${nanoid()}`,
			userId: payload.userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		await db.insert(chat).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new CreateChatInDBError("Failed to create new chat in DB", { cause: (error as Error).message });
	}
}

export async function getChatByIdFromDB(chatId: string) {
	try {
		const chatDetails = await db.select().from(chat).where(eq(chat.chatId, chatId));
		return chatDetails[0];
	} catch (error) {
		throw new GetChatByIdFromDBError("Failed to get chat by ID from DB", { cause: (error as Error).message });
	}
}
