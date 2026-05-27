import { SarvamAIClient } from "sarvamai";
import { GenerateSarvamResponseError } from "../exceptions/sarvam.exceptions";

const client = new SarvamAIClient({
	apiSubscriptionKey: process.env.SARVAM_API_KEY || "",
});

// biome-ignore lint/suspicious/noExplicitAny: <dynamic prompt structure for chat completion>
export async function generateSarvamResponse(payload: { prompt: any; model: string }) {
	try {
		const response = await client.chat.completions({
			messages: payload.prompt,
			// biome-ignore lint/suspicious/noExplicitAny: <parameter model has different type other than string for sarvam>
			model: payload.model as any,
			temperature: 0.7,
		});
		if (!response.choices[0].message.content) {
			throw new GenerateSarvamResponseError("Failed to generate response from Sarvam", { cause: "No content generated" });
		}
		return JSON.parse(response.choices[0].message.content);
	} catch (error) {
		if (error instanceof GenerateSarvamResponseError) {
			throw error;
		}
		throw new GenerateSarvamResponseError("Failed to generate response from Sarvam", { cause: (error as Error).message });
	}
}
