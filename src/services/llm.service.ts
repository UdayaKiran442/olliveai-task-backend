import { QueryChatLLMError } from "../exceptions/llm.exceptions";
import { GenerateOpenAIResponseError } from "../exceptions/openai.exceptions";
import { GenerateSarvamResponseError } from "../exceptions/sarvam.exceptions";
import { generateOpenAIResponse } from "./openai.service";
import { generateSarvamResponse } from "./sarvam.service";

export async function queryChatLLM(payload: { prompt: string; model: string; provider: string; history: string }) {
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
		switch (payload.provider) {
			case "openai": {
				// call openai api with prompt and model
				const openAIResponse = await generateOpenAIResponse({ prompt, model: payload.model });
				response = openAIResponse.response;
				break;
			}
			case "sarvam": {
				// call sarvam api with prompt and model
				const sarvamResponse = await generateSarvamResponse({ prompt, model: payload.model });
				response = sarvamResponse.response;
				break;
			}
		}
		// return response from llm
		return response;
	} catch (error) {
		// handle fallback mechanism for llm query failure (if any)
		if (error instanceof GenerateOpenAIResponseError) {
			// if openai response generation fails, we can fallback to sarvam for response generation
			try {
				const sarvamResponse = await generateSarvamResponse({ prompt: payload.prompt, model: payload.model });
				return sarvamResponse.response;
			} catch (sarvamError) {
				throw new QueryChatLLMError("Failed to generate response from both openai and sarvam", { cause: `OpenAI error: ${error.message}, Sarvam error: ${(sarvamError as Error).message}` });
			}
		}

		if (error instanceof GenerateSarvamResponseError) {
			// if sarvam response generation fails, we can fallback to openai for response generation
			try {
				const openAIResponse = await generateOpenAIResponse({ prompt, model: payload.model });
				return openAIResponse.response;
			} catch (openAIError) {
				throw new QueryChatLLMError("Failed to generate response from both sarvam and openai", { cause: `Sarvam error: ${error.message}, OpenAI error: ${(openAIError as Error).message}` });
			}
		}
	}
}
