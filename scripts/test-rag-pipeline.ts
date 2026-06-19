// Mock environment variables to force local fallback
process.env.DATABASE_URL = "";
process.env.OPENAI_API_KEY = "";
process.env.COHERE_API_KEY = "";

import { db } from "../lib/db";
import { getEmbedding } from "../lib/embeddings";
import { rerank } from "../lib/reranker";
import { evaluateRun } from "../lib/evaluator";

async function runTest() {
  console.log("=== Testing Ledger AI RAG Pipeline (Local Fallback) ===\n");

  // 1. Initialize DB
  console.log("1. Initializing Database...");
  await db.initialize();
  
  const documents = await db.getDocuments();
  console.log(`- Loaded ${documents.length} pre-populated documents from database.`);
  
  // 2. Compute embedding
  const query = "access review security controls and access credentials";
  console.log(`\n2. Generating Embedding for query: "${query}"...`);
  const queryEmbed = await getEmbedding(query);
  console.log(`- Embeddings generated. Dimension: ${queryEmbed.length}`);

  // 3. Similarity Search
  console.log("\n3. Performing Similarity Search (Cosine Distance in TS)...");
  const rawMatches = await db.getSimilaritySearchResults(queryEmbed, 4);
  console.log(`- Found ${rawMatches.length} raw semantic matches:`);
  rawMatches.forEach((m, idx) => {
    console.log(`  [Match #${idx+1}] Doc: ${m.chunk.documentId}, Similarity: ${(m.similarity * 100).toFixed(1)}%`);
    console.log(`  Snippet: "${m.chunk.content.substring(0, 80)}..."`);
  });

  // 4. Reranking
  console.log("\n4. Performing Semantic Reranking (Term Density)...");
  const reranked = await rerank(query, rawMatches, 3);
  console.log(`- Reranked top results (limit 3):`);
  reranked.forEach((r, idx) => {
    console.log(`  [Rank #${idx+1}] Doc: ${r.chunk.documentId}, Vector score: ${r.vectorScore}%, Rerank score: ${r.rerankScore}%`);
    console.log(`  Snippet: "${r.chunk.content.substring(0, 90)}..."`);
  });

  // 5. Evaluation Harness
  console.log("\n5. Running Evaluation Harness...");
  const mockAnswer = "A compliance roadmap must establish quarterly access reviews and central directories to manage logical access and credentials security.";
  const citations = [
    { cite: "SOC 2 Control Matrix.pdf", content: reranked[0].chunk.content }
  ];
  
  const evals = await evaluateRun(
    query,
    reranked.map(r => r.chunk),
    mockAnswer,
    citations
  );

  console.log("\n=== Evaluation Results ===");
  console.log(`- Retrieval Quality: ${evals.retrievalQuality}%`);
  console.log(`  Reason: ${evals.retrievalQualityReasoning}`);
  console.log(`- Answer Faithfulness: ${evals.faithfulness}%`);
  console.log(`  Reason: ${evals.faithfulnessReasoning}`);
  console.log(`- Citation Accuracy: ${evals.citationAccuracy}%`);
  console.log(`  Reason: ${evals.citationAccuracyReasoning}`);

  console.log("\n=== Pipeline Verification Successful! ===");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
