import { OpenAI } from "openai";
import { db } from "./db";

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function getEmbedding(text: string): Promise<number[]> {
  if (openai) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, " ")
      });
      return response.data[0].embedding;
    } catch (err) {
      console.warn("Failed to generate OpenAI embedding, falling back to local:", err);
    }
  }

  // Check HuggingFace Serverless Inference API as alternative fallback
  if (process.env.HF_API_KEY) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: text })
        }
      );
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result)) return result;
      }
    } catch (err) {
      console.warn("Failed to generate HuggingFace embedding, falling back to local:", err);
    }
  }

  // Fallback: Use local deterministic hashing
  return db.generateHashEmbedding(text);
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (openai) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts.map(t => t.replace(/\n/g, " "))
      });
      return response.data.map(item => item.embedding);
    } catch (err) {
      console.warn("Failed to generate bulk OpenAI embeddings, falling back to local:", err);
    }
  }

  // Fallback: Generate individually
  return Promise.all(texts.map(t => getEmbedding(t)));
}
