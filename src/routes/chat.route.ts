import { Hono } from "hono";
import z from "zod";
import { createChat, getAllUserChats, getChatHistory, queryChat } from "../controller/chat.controller";
import { CreateChatError, CreateChatInDBError, GetChatByIdFromDBError, GetChatHistoryError, GetUserChatsError, GetUserChatsFromDBError } from "../exceptions/chat.exceptions";
import { authMiddleware } from "../middleware/authentication.middleware";
import { ConvertToEmbeddingsServiceError, QueryChatError } from "../exceptions/openai.exceptions";
import { QueryPineconeServiceError, UpsertEmbeddingsToPineconeServiceError } from "../exceptions/pinecone.exceptions";
import { AddChatMessagesToDBError } from "../exceptions/message.exceptions";
import { QueryChatLLMError } from "../exceptions/llm.exceptions";
import { NotFoundError, UnauthorizedAccessError } from "../exceptions/common.exceptions";
import { AddMessageMetadataToDBError } from "../exceptions/messageMetadata.exceptions";

const chatRoute = new Hono();

chatRoute.post("/new-chat", authMiddleware, async (c) => {
	try {
		const newChat = await createChat({
			userId: c.get("user").userId,
		});
		return c.json({ success: true, chat: newChat });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 401);
		}
		if (error instanceof CreateChatInDBError || error instanceof CreateChatError) {
			return c.json({ success: false, error: error.message }, 401);
		}
		return c.json({ success: false, error: (error as Error).message }, 500);
	}
});

const ChatQuerySchema = z.object({
	chatId: z.string(),
	query: z.string(),
	model: z.string(),
	provider: z.string(),
});

export type IChatQuerySchema = z.infer<typeof ChatQuerySchema> & { userId: string };

chatRoute.post("/query", async (c) => {
	try {
		const validation = ChatQuerySchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			userId: "user_3EFRtfVOgds9cLzWGFQzvXgebj0",
		};
		const response = await queryChat(payload);
		return c.json({ success: true, response });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 401);
		}
		if (
			error instanceof ConvertToEmbeddingsServiceError ||
			error instanceof QueryPineconeServiceError ||
			error instanceof QueryChatLLMError ||
			error instanceof AddChatMessagesToDBError ||
			error instanceof UpsertEmbeddingsToPineconeServiceError ||
			error instanceof QueryChatError ||
			error instanceof AddMessageMetadataToDBError
		) {
			return c.json({ success: false, error: error.message }, 401);
		}
		return c.json({ success: false, error: (error as Error).message }, 500);
	}
});

const ChatHistorySchema = z.object({
	chatId: z.string(),
});

export type IChatHistorySchema = z.infer<typeof ChatHistorySchema> & { userId: string };

chatRoute.post("/history", async (c) => {
	try {
		const validation = ChatHistorySchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			userId: "user_3EFRtfVOgds9cLzWGFQzvXgebj0",
		};
		const messages = await getChatHistory(payload);
		return c.json({ success: true, messages });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 401);
		}
		if (error instanceof GetChatHistoryError || error instanceof GetChatByIdFromDBError) {
			return c.json({ success: false, error: error.message }, 401);
		}
		if (error instanceof UnauthorizedAccessError) {
			return c.json({ success: false, error: error.message }, 403);
		}
		if (error instanceof NotFoundError) {
			return c.json({ success: false, error: error.message }, 404);
		}
		return c.json({ success: false, error: (error as Error).message }, 500);
	}
});

chatRoute.get("/all-chats", authMiddleware, async (c) => {
	try {
		const userId = c.get("user").userId;
		const chats = await getAllUserChats(userId);
		return c.json({ success: true, chats });
	} catch (error) {
		if (error instanceof GetUserChatsFromDBError || error instanceof GetUserChatsError) {
			return c.json({ success: false, error: error.message }, 401);
		}
		return c.json({ success: false, error: (error as Error).message }, 500);
	}
}); 

export default chatRoute;
