import { Hono } from 'hono'
import apiRouter from './routes'
import { cors } from 'hono/cors'
import { convertToEmbeddingsService } from './services/openai.service'
import { queryChatLLM } from './services/llm.service'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.use(
	"/*",
	cors({
		origin: ["http://localhost:3001"],
	}),
);

app.get("/test", async (c) => {
	const embeddings = await convertToEmbeddingsService("Hello world");
	return c.json({ success: true, embeddings });
})

app.get("/test2", async (c) => {
	const response = await queryChatLLM({
		model: "gpt-4o-mini",
		prompt: "Hi",
		history: "",
		provider: "openai"
	})
	return c.json({ success: true, response });
})

app.route("/api", apiRouter);

export default app
