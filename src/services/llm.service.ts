import { QueryChatLLMError } from "../exceptions/llm.exceptions";
import { GenerateOpenAIResponseError } from "../exceptions/openai.exceptions";
import { GenerateSarvamResponseError } from "../exceptions/sarvam.exceptions";
import { generateOpenAIResponse } from "./openai.service";
import { generateSarvamResponse } from "./sarvam.service";

export async function queryChatLLM(payload: { prompt: string; model: string; provider: string; history: string }, isFallback = false): Promise<{ response: string; tokens: number; requestId: string }> {
	try {
		const prompt = [
			{
				role: "system",
				content: "You are a helpful assistant that helps the user with their queries.",
			},
			{
				role: "user",
				content: `Here is the conversation history that might be relevant to the user's query: ${payload.history}`,
			},
			{
				role: "user",
				content: `Here is the user's query: ${payload.prompt}. Please provide a helpful and detailed response to the user's query based on the conversation history and your knowledge.`,
			},
			{
				role: "assistant",
				content: "Provide response in JSON format with the following structure: { response: '' }",
			},
		];

		let response = "";
		let tokens = 0;
		let requestId = "";
		switch (payload.provider) {
			case "openai": {
				const openAIResponse = await generateOpenAIResponse({ prompt, model: payload.model });
				response = openAIResponse.response;
				tokens = openAIResponse.tokens;
				requestId = openAIResponse.requestId;
				break;
			}
			case "sarvam": {
				const sarvamResponse = await generateSarvamResponse({ prompt, model: payload.model });
				response = sarvamResponse.response;
				tokens = sarvamResponse.tokens;
				requestId = sarvamResponse.requestId;
				break;
			}
		}
		return { response, tokens, requestId };
	} catch (error) {
		if (!isFallback) {
			if (error instanceof GenerateOpenAIResponseError) {
				return queryChatLLM({ ...payload, provider: "sarvam", model: "sarvam-30b" }, true);
			}
			if (error instanceof GenerateSarvamResponseError) {
				return queryChatLLM({ ...payload, provider: "openai", model: "gpt-4o-mini" }, true);
			}
		}
		throw new QueryChatLLMError("Failed to get response from LLM", { cause: (error as Error).message });
	}
}