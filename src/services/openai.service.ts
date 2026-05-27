import OpenAI from "openai";
import { ConvertToEmbeddingsServiceError, GenerateOpenAIResponseError } from "../exceptions/openai.exceptions";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function convertToEmbeddingsService(text: string) {
	try {
		const embedding = await openai.embeddings.create({
			model: "text-embedding-3-small",
			input: text,
			dimensions: 512
		});
		return embedding.data[0].embedding;
	} catch (error) {
		throw new ConvertToEmbeddingsServiceError("Failed to convert text to embeddings", { cause: (error as Error).message });
	}
}

// biome-ignore lint/suspicious/noExplicitAny: <dynamic prompt structure for chat completion>
export async function generateOpenAIResponse(payload: { prompt: any; model: string }) {
	try {
		const response = await openai.chat.completions.create({
			model: payload.model,
			messages: payload.prompt,
			response_format: {
				type: "json_object",
			},
			temperature: 0.7,
		});
		if (!response.usage || !response._request_id) {
			throw new GenerateOpenAIResponseError("Failed to generate response from OpenAI", { cause: "No usage data returned" });
		}
		if (!response.choices[0].message.content) {
			throw new GenerateOpenAIResponseError("Failed to generate response from OpenAI", { cause: "No content generated" });
		}
		const parsedResponse = (JSON.parse(response.choices[0].message.content)).response as string;
		return { response: parsedResponse, tokens: response.usage.total_tokens, requestId: response._request_id };
	} catch (error) {
		if (error instanceof GenerateOpenAIResponseError) {
			throw error;
		}
		throw new GenerateOpenAIResponseError("Failed to generate response from OpenAI", { cause: (error as Error).message });
	}
}
