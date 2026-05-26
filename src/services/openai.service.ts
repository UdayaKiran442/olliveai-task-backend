import OpenAI from "openai";
import { ConvertToEmbeddingsServiceError } from "../exceptions/openai.exceptions";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function convertToEmbeddingsService(text: string) {
	try {
		const embedding = await openai.embeddings.create({
			model: "text-embedding-3-small",
			input: text,
		});
		return embedding.data[0].embedding;
	} catch (error) {
        console.log(error);
		throw new ConvertToEmbeddingsServiceError("Failed to convert text to embeddings", { cause: (error as Error).message });
	}
}
