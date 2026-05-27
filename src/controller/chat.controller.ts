import { CreateChatError, CreateChatInDBError, GetChatByIdFromDBError, GetChatHistoryError, GetUserChatsError, GetUserChatsFromDBError } from "../exceptions/chat.exceptions";
import { NotFoundError, UnauthorizedAccessError } from "../exceptions/common.exceptions";
import { QueryChatLLMError } from "../exceptions/llm.exceptions";
import { AddChatMessagesToDBError } from "../exceptions/message.exceptions";
import { AddMessageMetadataToDBError } from "../exceptions/messageMetadata.exceptions";
import { ConvertToEmbeddingsServiceError, QueryChatError } from "../exceptions/openai.exceptions";
import { QueryPineconeServiceError, UpsertEmbeddingsToPineconeServiceError } from "../exceptions/pinecone.exceptions";
import { createChatInDB, getAllUserChatsFromDB, getChatByIdFromDB } from "../repository/chat.repository";
import { addMessageMetadataToDB } from "../repository/messageMetadata.repository";
import { addChatMessagesToDB, getChatMessagesFromDB } from "../repository/messages.repository";
import type { IChatHistorySchema, IChatQuerySchema } from "../routes/chat.route";
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

export async function getChatHistory(payload: IChatHistorySchema) {
	try {
		const chat = await getChatByIdFromDB(payload.chatId);
		if (chat.userId !== payload.userId) {
			throw new UnauthorizedAccessError("Unauthorized access to chat history");
		}
		if (!chat) {
			throw new NotFoundError("Chat not found");
		}
		return await getChatMessagesFromDB(payload.chatId);
	} catch (error) {
		if (error instanceof GetChatByIdFromDBError || error instanceof NotFoundError || error instanceof UnauthorizedAccessError) {
			throw error;
		}
		throw new GetChatHistoryError("Failed to get chat history", { cause: (error as Error).message });
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
		const responseEmbeddings = await convertToEmbeddingsService(response.response);
		const [chatMessage, _] = await Promise.all([
			addChatMessagesToDB({
				chatId: payload.chatId,
				query: payload.query,
				response: response.response,
				model: payload.model,
				provider: payload.provider,
			}),
			upsertEmbeddingsToPineconeService({
				indexName: "olliveai-task",
				metadata: {
					chatId: payload.chatId,
					text: `Query: ${payload.query}, Response: ${response.response}`,
				},
				vectors: responseEmbeddings,
			}),
		]);
		await addMessageMetadataToDB({
			chatId: payload.chatId,
			messageId: chatMessage.messageId,
			prompt: payload.query,
			response: response.response,
			tokens: response.tokens,
			provider: payload.provider,
			model: payload.model,
			requestId: response.requestId,
			userId: payload.userId,
		});
		// return the response
		return response.response;
	} catch (error) {
		if (
			error instanceof ConvertToEmbeddingsServiceError ||
			error instanceof QueryPineconeServiceError ||
			error instanceof QueryChatLLMError ||
			error instanceof AddChatMessagesToDBError ||
			error instanceof UpsertEmbeddingsToPineconeServiceError ||
			error instanceof AddMessageMetadataToDBError
		) {
			throw error;
		}
		console.error(error);
		throw new QueryChatError("Failed to query chat", { cause: (error as Error).message });
	}
}

export async function getAllUserChats(userId: string) {
	try {
		return await getAllUserChatsFromDB(userId);
	} catch (error) {
		if (error instanceof GetUserChatsFromDBError) {
			throw error;
		}
		throw new GetUserChatsError("Failed to get user chats", { cause: (error as Error).message });
	}
}
