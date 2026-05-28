import { NotFoundError, UnauthorizedAccessError } from "../exceptions/common.exceptions";
import { GetMessageMetadataByIdError, GetMessageMetadataByIdFromDBError, GetMessageMetadataByUserIdError, UpdateMessageMetadataError, UpdateMessageMetadataInDBError } from "../exceptions/messageMetadata.exceptions";
import { getMessageMetadataByIdFromDB, getMessageMetadataByUserIdFromDB, updateMessageMetadataInDB } from "../repository/messageMetadata.repository";
import type { IFetchMessageMetadataSchema } from "../routes/messageMetadata.route";

export async function getMessageMetadataByUserId(userId: string) {
	try {
		return await getMessageMetadataByUserIdFromDB(userId);
	} catch (error) {
		throw new GetMessageMetadataByUserIdError("Failed to get message metadata by user ID", { cause: (error as Error).message });
	}
}

export async function getMessageMetadataById(payload: IFetchMessageMetadataSchema) {
	try {
		const metadata = await getMessageMetadataByIdFromDB(payload.metadataId);
		if (!metadata) {
			throw new NotFoundError("Message metadata not found");
		}
		if (metadata.userId !== payload.userId) {
			throw new UnauthorizedAccessError("You do not have access to this message metadata");
		}
		return metadata;
	} catch (error) {
		if (error instanceof NotFoundError || error instanceof UnauthorizedAccessError || error instanceof GetMessageMetadataByIdFromDBError) {
			throw error;
		}
		throw new GetMessageMetadataByIdError("Failed to get message metadata by ID", { cause: (error as Error).message });
	}
}

export async function updateMessageMetadata(payload: {messageId: string; latency?: number}) {
	try {
		await updateMessageMetadataInDB({messageId: payload.messageId, latency: payload.latency});
	} catch (error) {
		if (error instanceof UpdateMessageMetadataInDBError) {
			throw error;
		}
		throw new UpdateMessageMetadataError("Failed to update message metadata", { cause: (error as Error).message });
	}
}