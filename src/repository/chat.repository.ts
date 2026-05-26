import { nanoid } from "nanoid";
import db from "./db";
import { chat } from "./schema";
import { CreateChatInDBError } from "../exceptions/chat.exceptions";

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
