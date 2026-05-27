import { Hono } from "hono";
import { authMiddleware } from "../middleware/authentication.middleware";
import { getMessageMetadataByUserId } from "../controller/messageMetadata.controller";
import { GetMessageMetadataByUserIdError, GetMessageMetadataByUserIdFromDBError } from "../exceptions/messageMetadata.exceptions";

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
})

export default messageMetadataRoute;