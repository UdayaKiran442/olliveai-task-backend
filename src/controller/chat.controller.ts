import { CreateChatError, CreateChatInDBError } from "../exceptions/chat.exceptions";
import { QueryChatLLMError } from "../exceptions/llm.exceptions";
import { AddChatMessagesToDBError } from "../exceptions/message.exceptions";
import { ConvertToEmbeddingsServiceError, QueryChatError } from "../exceptions/openai.exceptions";
import { QueryPineconeServiceError, UpsertEmbeddingsToPineconeServiceError } from "../exceptions/pinecone.exceptions";
import { createChatInDB } from "../repository/chat.repository";
import { addChatMessagesToDB } from "../repository/messages.repository";
import type { IChatQuerySchema } from "../routes/chat.route";
import { queryChatLLM } from "../services/llm.service";
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
		const response = await queryChatLLM({
			history,
			prompt: payload.query,
			model: payload.model,
			provider: payload.provider,
		});
		// save the query, response
		const responseEmbeddings = await convertToEmbeddingsService(response);
		await Promise.all([
			addChatMessagesToDB({
				chatId: payload.chatId,
				query: payload.query,
				response,
				model: payload.model,
				provider: payload.provider,
			}),
			upsertEmbeddingsToPineconeService({
				indexName: "olliveai-task",
				metadata: {
					chatId: payload.chatId,
					text: `Query: ${payload.query}, Response: ${response}`,
				},
				vectors: responseEmbeddings,
			}),
		]);
		// return the response
		return response;
	} catch (error) {
		if (
			error instanceof ConvertToEmbeddingsServiceError ||
			error instanceof QueryPineconeServiceError ||
			error instanceof QueryChatLLMError ||
			error instanceof AddChatMessagesToDBError ||
			error instanceof UpsertEmbeddingsToPineconeServiceError
		) {
			throw error;
		}
		throw new QueryChatError("Failed to query chat", { cause: (error as Error).message });
	}
}
