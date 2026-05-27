import { Hono } from "hono";
import apiRouter from "./routes";
import { cors } from "hono/cors";
import { convertToEmbeddingsService, generateOpenAIResponse } from "./services/openai.service";
import { generateSarvamResponse } from "./services/sarvam.service";
import { queryPineconeService } from "./services/pinecone.service";
import { nanoid } from "nanoid";

const app = new Hono();

app.get("/", (c) => {
	const id = nanoid();
	return c.text(id);
});

app.use(
	"/*",
	cors({
		origin: ["http://localhost:3001"],
	}),
);

app.get("/test", async (c) => {
	const embeddings = await convertToEmbeddingsService("Hello world");
	return c.json({ success: true, embeddings });
});

app.get("/test2", async (c) => {
	const embeddings = await convertToEmbeddingsService("How is it useful in realworld ?");

	// retreive relevant past messages from the same chat using the embeddings from vector db
	const history = await queryPineconeService({
		chatId: "chat_z9y5TWdWgq08J-6C6jXV9",
		indexName: "olliveai-task",
		promptVector: embeddings,
	});
	return c.json({ success: true, history });
});

app.get("/test3", async (c) => {
	const prompt = [
		{
			role: "system",
			content: "You are a helpful assistant that helps the user with their queries.",
		},
		{
			role: "user",
			content: `Here is the conversation history that might be relevant to the user's query: ''`,
		},
		{
			role: "user",
			content: `Here is the user's query: "Hi".`,
		},
		{
			role: "assistant",
			content: "Provide response in JSON format with the following structure: { response: '' }",
		},
	];
	const response = await generateSarvamResponse({ prompt, model: "sarvam-30b" });
	return c.json({ success: true, response });
});

app.route("/api", apiRouter);

export default app;
