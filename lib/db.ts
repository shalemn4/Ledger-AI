import fs from "fs";
import path from "path";
import { Client } from "pg";
import { ProjectConfig, projectsData } from "./project-data";
import { DocumentItem } from "./workspace-store";

export type DbChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
};

const DB_DIR = path.join(process.cwd(), "data");
const JSON_DB_PATH = path.join(DB_DIR, "db.json");

// Default docs to initialize in the DB
const defaultDocs: DocumentItem[] = [
  {
    id: "doc-1",
    name: "EU AI Act — Controls.pdf",
    size: "1.4 MB",
    uploadedAt: "2026-06-12",
    status: "Indexed",
    chunks: 4,
    content: "The EU Artificial Intelligence Act sets out rules for risk management and transparency in AI systems. High-risk systems require rigorous data governance, detailed logging, and human oversight. Article 4.2 specifically highlights controls around security, risk mitigation, and systemic reviews to ensure transparency and accountability."
  },
  {
    id: "doc-2",
    name: "SOC 2 Control Matrix.pdf",
    size: "450 KB",
    uploadedAt: "2026-06-14",
    status: "Indexed",
    chunks: 3,
    content: "SOC 2 CC6.1 specifies logical access security controls. Organizations must manage credentials, implement quarterly access reviews, and establish vendor compliance criteria. Auditable evidence must be recorded for authorization changes, system logging, and vulnerability management cycles."
  },
  {
    id: "doc-3",
    name: "Data Retention Policy.pdf",
    size: "320 KB",
    uploadedAt: "2026-06-15",
    status: "Indexed",
    chunks: 3,
    content: "Under Section 12 of the Data Retention Policy, user prompt logs, retriever tokens, and model outputs must be stored securely for at least 7 years. These records are subject to compliance reviews. Access to raw logging data must be restricted to authorized auditors."
  },
  {
    id: "doc-4",
    name: "Vendor Security Standard.pdf",
    size: "890 KB",
    uploadedAt: "2026-06-16",
    status: "Indexed",
    chunks: 3,
    content: "Section 7 of the Vendor Security Standard defines the review cadence for external subprocessors. Third-party risk assessments must be updated annually or upon material changes to data flows. The builder system must capture and verify data sharing citations automatically before synthesis."
  }
];

class Database {
  private pgClient: Client | null = null;
  private isInitialized = false;

  constructor() {
    // Check if Postgres is configured
    if (process.env.DATABASE_URL) {
      this.pgClient = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false }
      });
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.pgClient) {
      try {
        await this.pgClient.connect();
        // Enable pgvector
        await this.pgClient.query("CREATE EXTENSION IF NOT EXISTS vector;");
        
        // Create tables
        await this.pgClient.query(`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            size TEXT NOT NULL,
            uploaded_at TEXT NOT NULL,
            status TEXT NOT NULL,
            chunks INTEGER NOT NULL,
            content TEXT NOT NULL
          );
        `);

        // Check the current embedding dimension (OpenAI uses 1536 by default)
        const embedDim = process.env.OPENAI_API_KEY ? 1536 : 128;
        await this.pgClient.query(`
          CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            embedding vector(${embedDim})
          );
        `);

        await this.pgClient.query(`
          CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            run_id TEXT NOT NULL,
            prompt TEXT NOT NULL,
            metadata TEXT NOT NULL,
            agent_label TEXT NOT NULL,
            plan TEXT[] NOT NULL,
            output JSONB NOT NULL,
            activities JSONB NOT NULL,
            tools JSONB NOT NULL,
            evals JSONB
          );
        `);

        // Check if DB is empty, pre-populate if true
        const docRes = await this.pgClient.query("SELECT COUNT(*) FROM documents;");
        if (parseInt(docRes.rows[0].count, 10) === 0) {
          await this.prepopulatePostgres();
        }
        
        this.isInitialized = true;
        console.log("Database initialized (Postgres Mode)");
        return;
      } catch (err) {
        console.warn("Failed to connect to Postgres, falling back to local JSON mode:", err);
        this.pgClient = null;
      }
    }

    // JSON Fallback initialization
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(JSON_DB_PATH)) {
      this.writeJsonDb({
        documents: defaultDocs,
        document_chunks: this.generateDefaultChunks(),
        projects: projectsData
      });
    }

    this.isInitialized = true;
    console.log("Database initialized (Local JSON Mode)");
  }

  // --- Postgres Prepopulation ---
  private async prepopulatePostgres(): Promise<void> {
    if (!this.pgClient) return;

    // 1. Insert default documents
    for (const doc of defaultDocs) {
      await this.pgClient.query(
        "INSERT INTO documents (id, name, size, uploaded_at, status, chunks, content) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [doc.id, doc.name, doc.size, doc.uploadedAt, doc.status, doc.chunks, doc.content]
      );
    }

    // 2. Insert default chunks
    const chunks = this.generateDefaultChunks();
    for (const chunk of chunks) {
      // Convert vector to PG vector string format: '[v1, v2, ...]'
      // Since PG table was created with embedDim, we ensure the array matches size
      const embedDim = process.env.OPENAI_API_KEY ? 1536 : 128;
      const embedding = chunk.embedding.slice(0, embedDim);
      while (embedding.length < embedDim) embedding.push(0);

      await this.pgClient.query(
        "INSERT INTO document_chunks (id, document_id, chunk_index, content, embedding) VALUES ($1, $2, $3, $4, $5)",
        [chunk.id, chunk.documentId, chunk.chunkIndex, chunk.content, `[${embedding.join(",")}]`]
      );
    }

    // 3. Insert default projects
    for (const [id, proj] of Object.entries(projectsData)) {
      await this.pgClient.query(
        "INSERT INTO projects (id, name, run_id, prompt, metadata, agent_label, plan, output, activities, tools, evals) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
        [
          proj.id,
          proj.name,
          proj.runId,
          proj.prompt,
          proj.metadata,
          proj.agentLabel,
          proj.plan,
          JSON.stringify(proj.output),
          JSON.stringify(proj.activities),
          JSON.stringify(proj.tools),
          proj.evals ? JSON.stringify(proj.evals) : null
        ]
      );
    }
  }

  // --- Document Methods ---
  public async getDocuments(): Promise<DocumentItem[]> {
    await this.initialize();
    if (this.pgClient) {
      const res = await this.pgClient.query("SELECT * FROM documents ORDER BY uploaded_at DESC;");
      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        size: row.size,
        uploadedAt: row.uploaded_at,
        status: row.status as any,
        chunks: row.chunks,
        content: row.content
      }));
    } else {
      return this.readJsonDb().documents;
    }
  }

  public async getDocument(id: string): Promise<DocumentItem | null> {
    await this.initialize();
    if (this.pgClient) {
      const res = await this.pgClient.query("SELECT * FROM documents WHERE id = $1;", [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        name: row.name,
        size: row.size,
        uploadedAt: row.uploaded_at,
        status: row.status as any,
        chunks: row.chunks,
        content: row.content
      };
    } else {
      const db = this.readJsonDb();
      return db.documents.find((d: DocumentItem) => d.id === id) || null;
    }
  }

  public async addDocument(doc: DocumentItem): Promise<void> {
    await this.initialize();
    if (this.pgClient) {
      await this.pgClient.query(
        "INSERT INTO documents (id, name, size, uploaded_at, status, chunks, content) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, chunks = EXCLUDED.chunks;",
        [doc.id, doc.name, doc.size, doc.uploadedAt, doc.status, doc.chunks, doc.content]
      );
    } else {
      const db = this.readJsonDb();
      db.documents = [doc, ...db.documents.filter((d: DocumentItem) => d.id !== doc.id)];
      this.writeJsonDb(db);
    }
  }

  public async deleteDocument(id: string): Promise<void> {
    await this.initialize();
    if (this.pgClient) {
      await this.pgClient.query("DELETE FROM documents WHERE id = $1;", [id]);
    } else {
      const db = this.readJsonDb();
      db.documents = db.documents.filter((d: DocumentItem) => d.id !== id);
      db.document_chunks = db.document_chunks.filter((c: DbChunk) => c.documentId !== id);
      this.writeJsonDb(db);
    }
  }

  // --- Chunk Methods ---
  public async addDocumentChunks(chunks: DbChunk[]): Promise<void> {
    await this.initialize();
    if (this.pgClient) {
      const embedDim = process.env.OPENAI_API_KEY ? 1536 : 128;
      for (const chunk of chunks) {
        const embedding = chunk.embedding.slice(0, embedDim);
        while (embedding.length < embedDim) embedding.push(0);

        await this.pgClient.query(
          "INSERT INTO document_chunks (id, document_id, chunk_index, content, embedding) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING;",
          [chunk.id, chunk.documentId, chunk.chunkIndex, chunk.content, `[${embedding.join(",")}]`]
        );
      }
    } else {
      const db = this.readJsonDb();
      db.document_chunks.push(...chunks);
      this.writeJsonDb(db);
    }
  }

  public async getDocumentChunks(documentId: string): Promise<DbChunk[]> {
    await this.initialize();
    if (this.pgClient) {
      const res = await this.pgClient.query("SELECT * FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC;", [documentId]);
      return res.rows.map(row => ({
        id: row.id,
        documentId: row.document_id,
        chunkIndex: row.chunk_index,
        content: row.content,
        embedding: this.parsePgVector(row.embedding)
      }));
    } else {
      return this.readJsonDb().document_chunks.filter((c: DbChunk) => c.documentId === documentId);
    }
  }

  public async getSimilaritySearchResults(queryEmbedding: number[], limit = 4): Promise<Array<{ chunk: DbChunk, similarity: number }>> {
    await this.initialize();
    if (this.pgClient) {
      const embedDim = process.env.OPENAI_API_KEY ? 1536 : 128;
      const embedding = queryEmbedding.slice(0, embedDim);
      while (embedding.length < embedDim) embedding.push(0);

      // pgvector cosine distance operator is <=> (1 - cosine similarity)
      const res = await this.pgClient.query(
        `SELECT c.*, 1 - (c.embedding <=> $1) as similarity 
         FROM document_chunks c 
         ORDER BY c.embedding <=> $1 
         LIMIT $2;`,
        [`[${embedding.join(",")}]`, limit]
      );
      return res.rows.map(row => ({
        chunk: {
          id: row.id,
          documentId: row.document_id,
          chunkIndex: row.chunk_index,
          content: row.content,
          embedding: this.parsePgVector(row.embedding)
        },
        similarity: row.similarity
      }));
    } else {
      const chunks = this.readJsonDb().document_chunks;
      const scores = chunks.map((chunk: DbChunk) => {
        const sim = this.cosineSimilarity(queryEmbedding, chunk.embedding);
        return { chunk, similarity: sim };
      });
      return scores.sort((a: any, b: any) => b.similarity - a.similarity).slice(0, limit);
    }
  }

  // --- Project / Run Methods ---
  public async getProjects(): Promise<Record<string, ProjectConfig>> {
    await this.initialize();
    if (this.pgClient) {
      const res = await this.pgClient.query("SELECT * FROM projects;");
      const data: Record<string, ProjectConfig> = {};
      for (const row of res.rows) {
        data[row.id] = {
          id: row.id,
          name: row.name,
          runId: row.run_id,
          prompt: row.prompt,
          metadata: row.metadata,
          agentLabel: row.agent_label,
          sources: await this.getSourcesForProject(row.id),
          plan: row.plan,
          output: typeof row.output === "string" ? JSON.parse(row.output) : row.output,
          activities: typeof row.activities === "string" ? JSON.parse(row.activities) : row.activities,
          tools: typeof row.tools === "string" ? JSON.parse(row.tools) : row.tools,
          evals: row.evals ? (typeof row.evals === "string" ? JSON.parse(row.evals) : row.evals) : undefined
        };
      }
      return data;
    } else {
      return this.readJsonDb().projects;
    }
  }

  public async getProject(id: string): Promise<ProjectConfig | null> {
    await this.initialize();
    if (this.pgClient) {
      const res = await this.pgClient.query("SELECT * FROM projects WHERE id = $1;", [id]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      return {
        id: row.id,
        name: row.name,
        runId: row.run_id,
        prompt: row.prompt,
        metadata: row.metadata,
        agentLabel: row.agent_label,
        sources: await this.getSourcesForProject(row.id),
        plan: row.plan,
        output: typeof row.output === "string" ? JSON.parse(row.output) : row.output,
        activities: typeof row.activities === "string" ? JSON.parse(row.activities) : row.activities,
        tools: typeof row.tools === "string" ? JSON.parse(row.tools) : row.tools,
        evals: row.evals ? (typeof row.evals === "string" ? JSON.parse(row.evals) : row.evals) : undefined
      };
    } else {
      const db = this.readJsonDb();
      return db.projects[id] || null;
    }
  }

  public async saveProject(id: string, proj: ProjectConfig): Promise<void> {
    await this.initialize();
    if (this.pgClient) {
      // Store PG record
      await this.pgClient.query(
        `INSERT INTO projects (id, name, run_id, prompt, metadata, agent_label, plan, output, activities, tools, evals) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         ON CONFLICT (id) DO UPDATE SET 
           run_id = EXCLUDED.run_id,
           prompt = EXCLUDED.prompt,
           metadata = EXCLUDED.metadata,
           plan = EXCLUDED.plan,
           output = EXCLUDED.output,
           activities = EXCLUDED.activities,
           tools = EXCLUDED.tools,
           evals = EXCLUDED.evals;`,
        [
          proj.id,
          proj.name,
          proj.runId,
          proj.prompt,
          proj.metadata,
          proj.agentLabel,
          proj.plan,
          JSON.stringify(proj.output),
          JSON.stringify(proj.activities),
          JSON.stringify(proj.tools),
          proj.evals ? JSON.stringify(proj.evals) : null
        ]
      );
    } else {
      const db = this.readJsonDb();
      db.projects[id] = proj;
      this.writeJsonDb(db);
    }
  }

  private async getSourcesForProject(projectId: string): Promise<any[]> {
    // Return sources. In full DB, project sources are derived, but for our simple runs
    // we can preserve them in the project output config.
    const res = await this.pgClient!.query("SELECT output FROM projects WHERE id = $1;", [projectId]);
    if (res.rows.length > 0) {
      const output = typeof res.rows[0].output === "string" ? JSON.parse(res.rows[0].output) : res.rows[0].output;
      return output.sources || [];
    }
    return [];
  }

  // --- Helper Methods ---
  private readJsonDb(): { documents: DocumentItem[], document_chunks: DbChunk[], projects: Record<string, ProjectConfig> } {
    try {
      return JSON.parse(fs.readFileSync(JSON_DB_PATH, "utf8"));
    } catch {
      return { documents: [], document_chunks: [], projects: {} };
    }
  }

  private writeJsonDb(data: any): void {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), "utf8");
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    // Handle dimension mismatch gracefully
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private parsePgVector(vecStr: string): number[] {
    if (!vecStr) return [];
    // '[v1, v2, ...]' -> [v1, v2, ...]
    return vecStr.replace("[", "").replace("]", "").split(",").map(Number);
  }

  private generateDefaultChunks(): DbChunk[] {
    const list: DbChunk[] = [];
    defaultDocs.forEach((doc) => {
      // Break document text into roughly 3 sentences as chunks
      const sentences = doc.content.split(". ").filter(s => s.trim().length > 0);
      sentences.forEach((sentence, idx) => {
        const text = sentence.trim() + ".";
        list.push({
          id: `${doc.id}-chunk-${idx}`,
          documentId: doc.id,
          chunkIndex: idx,
          content: text,
          embedding: this.generateHashEmbedding(text)
        });
      });
    });
    return list;
  }

  // Pure deterministic fallback vectorizer (128 dimensions)
  public generateHashEmbedding(text: string): number[] {
    const vector = new Array(128).fill(0);
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    
    words.forEach((word) => {
      // Hash word to an index 0-127
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = (hash << 5) - hash + word.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      const index = Math.abs(hash) % 128;
      // Increment weight based on word frequency
      vector[index] += 1;
    });

    // Normalize the vector
    let norm = 0;
    for (let i = 0; i < 128; i++) norm += vector[i] * vector[i];
    if (norm > 0) {
      const sqrtNorm = Math.sqrt(norm);
      for (let i = 0; i < 128; i++) vector[i] /= sqrtNorm;
    }
    return vector;
  }
}

export const db = new Database();
