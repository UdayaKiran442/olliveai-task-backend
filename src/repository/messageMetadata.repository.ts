import db from "./db";
import { messageMetadata } from "./schema";
import { AddMessageMetadataToDBError } from "../exceptions/messageMetadata.exceptions";
import { nanoid } from "nanoid";

export async function addMessageMetadataToDB(payload: { messageId: string; chatId: string; prompt: string; response: string; tokens: number; provider: string; model: string; requestId: string }) {
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
			timestamp: new Date(),
		};
		await db.insert(messageMetadata).values(insertPayload);
		return insertPayload;
	} catch (error) {
		throw new AddMessageMetadataToDBError("Failed to add message metadata to DB", { cause: (error as Error).message });
	}
}
