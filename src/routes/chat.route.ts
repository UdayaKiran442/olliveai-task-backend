import { Hono } from "hono";
import z from "zod";
import { createChat, queryChat } from "../controller/chat.controller";
import { CreateChatError, CreateChatInDBError } from "../exceptions/chat.exceptions";
import { authMiddleware } from "../middleware/authentication.middleware";

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

chatRoute.post("/query", authMiddleware, async (c) => {
	try {
		const validation = ChatQuerySchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			userId: c.get("user").userId,
		};
        const response = await queryChat(payload);
        return c.json({ success: true, response });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 401);
		}
	}
});

export default chatRoute;
