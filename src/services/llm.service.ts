
import { QueryChatLLMError } from "../exceptions/llm.exceptions";
import { generateOpenAIResponse } from "./openai.service";
import { generateSarvamResponse } from "./sarvam.service";

export async function queryChatLLM(payload: { prompt: string; model: string; provider: string; history: string }): Promise<{ response: string; tokens: number; requestId: string }> {
	try {
		// write prompt template to send to llm
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

		// switch case for different llm providers and models
		let response = "";
		let tokens = 0;
		let requestId = "";
		switch (payload.provider) {
			case "openai": {
				// call openai api with prompt and model
				const openAIResponse = await generateOpenAIResponse({ prompt, model: payload.model });
				response = openAIResponse.response;
				tokens = openAIResponse.tokens;
				requestId = openAIResponse.requestId;
				break;
			}
			case "sarvam": {
				// call sarvam api with prompt and model
				const sarvamResponse = await generateSarvamResponse({ prompt, model: payload.model });
				response = sarvamResponse.response;
				tokens = sarvamResponse.tokens;
				requestId = sarvamResponse.requestId;
				break;
			}
		}
		// return response from llm
		return {response, tokens, requestId};
	} catch (error) {
		throw new QueryChatLLMError("Failed to get response from LLM", { cause: (error as Error).message });
	}
}
