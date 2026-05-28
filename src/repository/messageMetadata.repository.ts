import db from "./db";
import { messageMetadata } from "./schema";
import {
	AddMessageMetadataToDBError,
	GetAverageLatencyFromDBError,
	GetMessageMetadataByIdFromDBError,
	GetMessageMetadataByUserIdFromDBError,
	GetNumberOfRequestsFromDBError,
	GetThroughputFromDBError,
	UpdateMessageMetadataInDBError,
} from "../exceptions/messageMetadata.exceptions";
import { nanoid } from "nanoid";
import { desc, eq, sql } from "drizzle-orm";

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
		return await db.select().from(messageMetadata).where(eq(messageMetadata.userId, userId)).orderBy(desc(messageMetadata.timestamp));
	} catch (error) {
		throw new GetMessageMetadataByUserIdFromDBError("Failed to get message metadata by user ID from DB", { cause: (error as Error).message });
	}
}

export async function getMessageMetadataByIdFromDB(metadataId: string) {
	try {
		const metadata = await db.select().from(messageMetadata).where(eq(messageMetadata.metadataId, metadataId));
		return metadata[0];
	} catch (error) {
		throw new GetMessageMetadataByIdFromDBError("Failed to get message metadata by ID from DB", { cause: (error as Error).message });
	}
}

export async function updateMessageMetadataInDB(payload: { messageId: string; latency?: number }) {
	try {
		await db.update(messageMetadata).set({ latency: payload.latency }).where(eq(messageMetadata.messageId, payload.messageId));
	} catch (error) {
		throw new UpdateMessageMetadataInDBError("Failed to update message metadata in DB", { cause: (error as Error).message });
	}
}

export async function getNumberOfRequestsFromDB(userId: string) {
	try {
		const countResult = await db.select().from(messageMetadata).where(eq(messageMetadata.userId, userId));
		return countResult.length;
	} catch (error) {
		throw new GetNumberOfRequestsFromDBError("Failed to get number of requests from DB", { cause: (error as Error).message });
	}
}

export async function getAverageLatencyFromDB(userId: string) {
	try {
		const result = await db
			.select({
				avgLatency: sql<number>`AVG(${messageMetadata.latency})`.mapWith(Number),
			})
			.from(messageMetadata)
			.where(eq(messageMetadata.userId, userId));
		return result[0].avgLatency;
	} catch (error) {
		throw new GetAverageLatencyFromDBError("Failed to get average latency from DB", { cause: (error as Error).message });
	}
}

export async function getThroughputFromDB(userId: string) {
	try {
		const result = await db
			.select({
				count: sql<number>`COUNT(*)`.mapWith(Number),
			})
			.from(messageMetadata)
			.where(eq(messageMetadata.userId, userId))
			.groupBy(sql`DATE_TRUNC('hour', ${messageMetadata.timestamp})`);
		return result[0].count;
	} catch (error) {
		throw new GetThroughputFromDBError("Failed to get throughput from DB", { cause: (error as Error).message });
	}
}
