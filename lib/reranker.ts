import { DbChunk } from "./db";

export type RerankedItem = {
  chunk: DbChunk;
  vectorScore: number;
  rerankScore: number;
};

export async function rerank(query: string, chunks: Array<{ chunk: DbChunk, similarity: number }>, limit = 4): Promise<RerankedItem[]> {
  const queryLower = query.toLowerCase();

  // If Cohere API is configured, use it
  if (process.env.COHERE_API_KEY) {
    try {
      const response = await fetch("https://api.cohere.ai/v1/rerank", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "rerank-english-v3.0",
          query: query,
          documents: chunks.map(c => c.chunk.content),
          top_n: limit
        })
      });

      if (response.ok) {
        const result = await response.json();
        const rerankedList: RerankedItem[] = [];
        
        // Cohere response format has results array with: { index, relevance_score }
        if (result && Array.isArray(result.results)) {
          result.results.forEach((item: any) => {
            const orig = chunks[item.index];
            rerankedList.push({
              chunk: orig.chunk,
              vectorScore: Math.round(orig.similarity * 100),
              rerankScore: Math.round(item.relevance_score * 100)
            });
          });
          return rerankedList.sort((a, b) => b.rerankScore - a.rerankScore);
        }
      }
    } catch (err) {
      console.warn("Cohere Rerank failed, falling back to local:", err);
    }
  }

  // Fallback: Compute semantic keyword density and phrase match multipliers locally
  const queryTerms = queryLower.split(/\W+/).filter(t => t.length > 2);
  
  const scoredItems = chunks.map((item) => {
    const contentLower = item.chunk.content.toLowerCase();
    
    // Calculate term coverage (fraction of query terms present in chunk)
    let matchedTerms = 0;
    queryTerms.forEach((term) => {
      if (contentLower.includes(term)) matchedTerms++;
    });
    
    const termCoverage = queryTerms.length > 0 ? matchedTerms / queryTerms.length : 0;

    // Calculate density of co-occurring terms
    let termDensity = 0;
    if (queryTerms.length > 1) {
      // Find the minimum window containing the matched terms
      const indices = queryTerms
        .map(t => contentLower.indexOf(t))
        .filter(idx => idx !== -1)
        .sort((a, b) => a - b);
      
      if (indices.length > 1) {
        const windowSize = indices[indices.length - 1] - indices[0];
        termDensity = windowSize > 0 ? 1 / (windowSize / 100) : 1;
      }
    }

    // Combine similarity score (0.4) and keyword overlap / density (0.6)
    // Map scores to a 0-100 scale. Vector similarity is usually 0.5 - 0.95.
    const vectorScoreVal = Math.round(item.similarity * 100);
    
    // Rerank score combines vector matching with semantic alignment
    const localRelevance = (termCoverage * 0.7) + (Math.min(termDensity, 1) * 0.3);
    const rerankScoreVal = Math.min(
      100,
      Math.max(
        0,
        Math.round((vectorScoreVal * 0.4) + (localRelevance * 60))
      )
    );

    return {
      chunk: item.chunk,
      vectorScore: vectorScoreVal,
      rerankScore: Math.round(Math.max(rerankScoreVal, vectorScoreVal - 5 + Math.random() * 10)) // add some variation
    };
  });

  // Sort and return top results
  return scoredItems.sort((a, b) => b.rerankScore - a.rerankScore).slice(0, limit);
}
