import { Hono } from "hono";
import userRoute from "./user.route";
import chatRoute from "./chat.route";
import messageMetadataRoute from "./messageMetadata.route";

const apiRouter = new Hono();

apiRouter.route("/user", userRoute);
apiRouter.route("/chat", chatRoute);
apiRouter.route("/message-metadata", messageMetadataRoute);

export default apiRouter;