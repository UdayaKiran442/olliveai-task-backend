import { Pinecone } from "@pinecone-database/pinecone";
import { QueryPineconeServiceError, UpsertEmbeddingsToPineconeServiceError } from "../exceptions/pinecone.exceptions";

const pc = new Pinecone({
	apiKey: process.env.PINECONE_API_KEY || "",
});

// biome-ignore lint/suspicious/noExplicitAny: <dynamic metadata for pinecone upsert>
export async function upsertEmbeddingsToPineconeService(payload: { vectors: number[]; indexName: string; metadata: any }) {
	try {
		const index = pc.index(payload.indexName);

		await index.upsert({
			records: [
				{
					id: crypto.randomUUID(),
					values: payload.vectors,
					metadata: payload.metadata,
				},
			],
		});
	} catch (error) {
		throw new UpsertEmbeddingsToPineconeServiceError("Failed to upsert embeddings to pinecone", { cause: (error as Error).message });
	}
}

export async function queryPineconeService(payload: { indexName: string; chatId: string; promptVector: number[] }) {
	try {
		const index = pc.index(payload.indexName);

		const queryResponse = await index.query({
			vector: payload.promptVector,
			topK: 10,
			filter: {
				chatId: payload.chatId,
			},
			includeMetadata: true,
		});
		if (!queryResponse.matches.length) {
			return "";
		}
		let history = "";
		for (const match of queryResponse.matches) {
			const prompt = match?.metadata?.prompt;
			const response = match?.metadata?.response;
			history += `Prompt: ${prompt}\nResponse: ${response}`;
		}
		return history;
	} catch (error) {
		console.error("Error querying Pinecone:", error);
		throw new QueryPineconeServiceError("Failed to query pinecone", { cause: (error as Error).message });
	}
}
