import { GetMessageMetadataByUserIdError } from "../exceptions/messageMetadata.exceptions";
import { getMessageMetadataByUserIdFromDB } from "../repository/messageMetadata.repository";

export async function getMessageMetadataByUserId(userId: string) {
	try {
		return await getMessageMetadataByUserIdFromDB(userId);
	} catch (error) {
		throw new GetMessageMetadataByUserIdError("Failed to get message metadata by user ID", { cause: (error as Error).message });
	}
}
