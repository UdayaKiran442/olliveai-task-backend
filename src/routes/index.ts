import { Hono } from "hono";
import userRoute from "./user.route";
import chatRoute from "./chat.route";

const apiRouter = new Hono();

apiRouter.route("/user", userRoute);
apiRouter.route("/chat", chatRoute);

export default apiRouter;