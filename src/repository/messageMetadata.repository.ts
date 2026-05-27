import db from "./db";
import { messageMetadata } from "./schema";
import { AddMessageMetadataToDBError, GetMessageMetadataByUserIdFromDBError } from "../exceptions/messageMetadata.exceptions";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export async function addMessageMetadataToDB(payload: {
	messageId: string;
	chatId: string;
	prompt: string;
	response: string;
	tokens: number;
	provider: string;
	model: string;
	requestId: string;
	userId: string;
}) {
	try {
		const insertPayload = {
			metadataId: `metadata_${nanoid()}`,
			messageId: payload.messageId,
			chatId: payload.chatId,
			prompt: payload.prompt,
			response: payload.response,
			tokens: payload.tokens,
			provider: payload.provider,
			model: payload.model,
			requestId: payload.requestId,
			userId: payload.userId,
			timestamp: new Date(),
		};
		await db.insert(messageMetadata).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new AddMessageMetadataToDBError("Failed to add message metadata to DB", { cause: (error as Error).message });
	}
}

export async function getMessageMetadataByUserIdFromDB(userId: string) {
	try {
		return await db.select().from(messageMetadata).where(eq(messageMetadata.userId, userId));
	} catch (error) {
		throw new GetMessageMetadataByUserIdFromDBError("Failed to get message metadata by user ID from DB", { cause: (error as Error).message });
	}
}
