import { CreateChatError, CreateChatInDBError } from "../exceptions/chat.exceptions";
import { ConvertToEmbeddingsServiceError, QueryChatError } from "../exceptions/openai.exceptions";
import { createChatInDB } from "../repository/chat.repository";
import type { IChatQuerySchema } from "../routes/chat.route";
import { convertToEmbeddingsService } from "../services/openai.service";
import { queryPineconeService, upsertEmbeddingsToPineconeService } from "../services/pinecone.service";

export async function createChat(payload: { userId: string }) {
	try {
		return createChatInDB(payload);
	} catch (error) {
		if (error instanceof CreateChatInDBError) {
			throw error;
		}
		throw new CreateChatError("Failed to create new chat", { cause: (error as Error).message });
	}
}

export async function queryChat(payload: IChatQuerySchema) {
	try {
		// convert query to vector embeddings
		const embeddings = await convertToEmbeddingsService(payload.query);

		// retreive relevant past messages from the same chat using the embeddings from vector db
		const history = await queryPineconeService({
			chatId: payload.chatId,
			indexName: "olliveai-task",
			promptVector: embeddings,
		});
		// send the query, along with the relevant past messages to the llm and get the response

		// save the query, response

		// return the response
	} catch (error) {
		if (error instanceof ConvertToEmbeddingsServiceError) {
			throw error;
		}
		throw new QueryChatError("Failed to query chat", { cause: (error as Error).message });
	}
}
