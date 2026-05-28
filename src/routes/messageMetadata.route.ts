import { Hono } from "hono";
import { authMiddleware } from "../middleware/authentication.middleware";
import { getMessageMetadataById, getMessageMetadataByUserId, updateMessageMetadata } from "../controller/messageMetadata.controller";
import { GetMessageMetadataByUserIdError, GetMessageMetadataByUserIdFromDBError, UpdateMessageMetadataError, UpdateMessageMetadataInDBError } from "../exceptions/messageMetadata.exceptions";
import z from "zod";

const messageMetadataRoute = new Hono();

messageMetadataRoute.get("/", authMiddleware, async (c) => {
	try {
		const userId = c.get("user").userId;
		const metadata = await getMessageMetadataByUserId(userId);
		return c.json({ success: true, metadata });
	} catch (error) {
		if (error instanceof GetMessageMetadataByUserIdFromDBError || error instanceof GetMessageMetadataByUserIdError) {
			return c.json({ success: false, message: error.message, cause: error.cause }, 401);
		}
		return c.json({ success: false, message: "An unexpected error occurred", cause: (error as Error).message }, 500);
	}
});

const FetchMessageMetadataSchema = z.object({
	metadataId: z.string(),
});

export type IFetchMessageMetadataSchema = z.infer<typeof FetchMessageMetadataSchema> & { userId: string };

messageMetadataRoute.post("/fetch-log", authMiddleware, async (c) => {
	try {
		const validation = FetchMessageMetadataSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			userId: c.get("user").userId,
		};
		const metadata = await getMessageMetadataById(payload);
		return c.json({ success: true, metadata });
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errMessage = JSON.parse(error.message);
			return c.json({ success: false, error: errMessage[0], message: errMessage[0].message }, 401);
		}
	}
});

const UpdateMessageMetadataSchema = z.object({
	messageId: z.string(),
	latency: z.number().optional(),
});

export type IUpdateMessageMetadataSchema = z.infer<typeof UpdateMessageMetadataSchema> & { userId: string };

messageMetadataRoute.post("/update-metadata", authMiddleware, async (c) => {
	try {
		const validation = UpdateMessageMetadataSchema.safeParse(await c.req.json());
		if (!validation.success) {
			throw validation.error;
		}
		const payload = {
			...validation.data,
			userId: c.get("user").userId,
		};
		await updateMessageMetadata(payload);
		return c.json({ success: true, message: "Message metadata updated successfully" });
	} catch (error) {
		if (error instanceof UpdateMessageMetadataError || error instanceof UpdateMessageMetadataInDBError) {
			return c.json({ success: false, message: error.message, cause: error.cause }, 401);
		}
		return c.json({ success: false, message: "An unexpected error occurred", cause: (error as Error).message }, 500);
	}
});

export default messageMetadataRoute;
