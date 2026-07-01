import fs from "fs";
import path from "path";
import os from "os";
import { Pool } from "pg";
import { ProjectConfig, projectsData } from "./project-data";
import { DocumentItem } from "./workspace-store";

export type DbChunk = {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
};

const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NODE_ENV === "production"
);

const DB_DIR = isServerless
  ? path.join(os.tmpdir(), "ledger-ai-data")
  : path.join(process.cwd(), "data");

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
  private pgPool: Pool | null = null;
  private isInitialized = false;
  private memoryDb: {
    documents: DocumentItem[];
    document_chunks: DbChunk[];
    projects: Record<string, ProjectConfig>;
  } | null = null;

  constructor() {
    // Check if Postgres is configured
    if (process.env.DATABASE_URL) {
      try {
        this.pgPool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
          connectionTimeoutMillis: 3000,
          query_timeout: 5000
        });
      } catch (err) {
        console.warn("Failed to construct pg Pool:", err);
        this.pgPool = null;
      }
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.pgPool) {
      try {
        await this.pgPool.query("SELECT 1;");
        try {
          await this.pgPool.query("CREATE EXTENSION IF NOT EXISTS vector;");
        } catch (extErr) {
          console.warn("Notice: Could not automatically create vector extension:", (extErr as Error).message);
        }
        
        await this.pgPool.query(`
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

        const embedDim = process.env.OPENAI_API_KEY ? 1536 : 128;
        await this.pgPool.query(`
          CREATE TABLE IF NOT EXISTS document_chunks (
            id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
            chunk_index INTEGER NOT NULL,
            content TEXT NOT NULL,
            embedding vector(${embedDim})
          );
        `);

        await this.pgPool.query(`
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

        const docRes = await this.pgPool.query("SELECT COUNT(*) FROM documents;");
        if (parseInt(docRes.rows[0].count, 10) === 0) {
          await this.prepopulatePostgres();
        }
        
        this.isInitialized = true;
        console.log("Database initialized (Postgres Mode)");
        return;
      } catch (err) {
        console.warn("Failed to connect or initialize Postgres, falling back to local JSON/memory mode:", err);
        this.pgPool = null;
      }
    }

    // JSON / Memory Fallback initialization
    if (!this.memoryDb) {
      try {
        if (fs.existsSync(JSON_DB_PATH)) {
          this.memoryDb = JSON.parse(fs.readFileSync(JSON_DB_PATH, "utf8"));
        }
      } catch (err) {
        console.warn("Could not read JSON_DB_PATH:", err);
      }

      if (!this.memoryDb) {
        const bundledDbPath = path.join(process.cwd(), "data", "db.json");
        try {
          if (fs.existsSync(bundledDbPath) && bundledDbPath !== JSON_DB_PATH) {
            this.memoryDb = JSON.parse(fs.readFileSync(bundledDbPath, "utf8"));
          }
        } catch (err) {
          console.warn("Could not read bundled data/db.json:", err);
        }
      }

      if (!this.memoryDb) {
        this.memoryDb = {
          documents: defaultDocs,
          document_chunks: this.generateDefaultChunks(),
          projects: projectsData
        };
      }

      this.writeJsonDb(this.memoryDb);
    }

    this.isInitialized = true;
    console.log("Database initialized (Local JSON/Memory Mode)");
  }

  // --- Postgres Prepopulation ---
  private async prepopulatePostgres(): Promise<void> {
    if (!this.pgPool) return;

    for (const doc of defaultDocs) {
      await this.pgPool.query(
        "INSERT INTO documents (id, name, size, uploaded_at, status, chunks, content) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING;",
        [doc.id, doc.name, doc.size, doc.uploadedAt, doc.status, doc.chunks, doc.content]
      );
    }

    const chunks = this.generateDefaultChunks();
    for (const chunk of chunks) {
      const embedDim = process.env.OPENAI_API_KEY ? 1536 : 128;
      const embedding = chunk.embedding.slice(0, embedDim);
      while (embedding.length < embedDim) embedding.push(0);

      await this.pgPool.query(
        "INSERT INTO document_chunks (id, document_id, chunk_index, content, embedding) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING;",
        [chunk.id, chunk.documentId, chunk.chunkIndex, chunk.content, `[${embedding.join(",")}]`]
      );
    }

    for (const [id, proj] of Object.entries(projectsData)) {
      await this.pgPool.query(
        "INSERT INTO projects (id, name, run_id, prompt, metadata, agent_label, plan, output, activities, tools, evals) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING;",
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
    if (this.pgPool) {
      try {
        const res = await this.pgPool.query("SELECT * FROM documents ORDER BY uploaded_at DESC;");
        return res.rows.map(row => ({
          id: row.id,
          name: row.name,
          size: row.size,
          uploadedAt: row.uploaded_at,
          status: row.status as any,
          chunks: row.chunks,
          content: row.content
        }));
      } catch (err) {
        console.warn("Postgres error in getDocuments, falling back to JSON:", err);
      }
    }
    return this.readJsonDb().documents;
  }

  public async getDocument(id: string): Promise<DocumentItem | null> {
    await this.initialize();
    if (this.pgPool) {
      try {
        const res = await this.pgPool.query("SELECT * FROM documents WHERE id = $1;", [id]);
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
      } catch (err) {
        console.warn("Postgres error in getDocument, falling back to JSON:", err);
      }
    }
    const db = this.readJsonDb();
    return db.documents.find((d: DocumentItem) => d.id === id) || null;
  }

  public async addDocument(doc: DocumentItem): Promise<void> {
    await this.initialize();
    if (this.pgPool) {
      try {
        await this.pgPool.query(
          "INSERT INTO documents (id, name, size, uploaded_at, status, chunks, content) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, chunks = EXCLUDED.chunks;",
          [doc.id, doc.name, doc.size, doc.uploadedAt, doc.status, doc.chunks, doc.content]
        );
        return;
      } catch (err) {
        console.warn("Postgres error in addDocument, falling back to JSON:", err);
      }
    }
    const db = this.readJsonDb();
    db.documents = [doc, ...db.documents.filter((d: DocumentItem) => d.id !== doc.id)];
    this.writeJsonDb(db);
  }

  public async deleteDocument(id: string): Promise<void> {
    await this.initialize();
    if (this.pgPool) {
      try {
        await this.pgPool.query("DELETE FROM documents WHERE id = $1;", [id]);
        return;
      } catch (err) {
        console.warn("Postgres error in deleteDocument, falling back to JSON:", err);
      }
    }
    const db = this.readJsonDb();
    db.documents = db.documents.filter((d: DocumentItem) => d.id !== id);
    db.document_chunks = db.document_chunks.filter((c: DbChunk) => c.documentId !== id);
    this.writeJsonDb(db);
  }

  // --- Chunk Methods ---
  public async addDocumentChunks(chunks: DbChunk[]): Promise<void> {
    await this.initialize();
    if (this.pgPool) {
      try {
        const embedDim = process.env.OPENAI_API_KEY ? 1536 : 128;
        for (const chunk of chunks) {
          const embedding = chunk.embedding.slice(0, embedDim);
          while (embedding.length < embedDim) embedding.push(0);

          await this.pgPool.query(
            "INSERT INTO document_chunks (id, document_id, chunk_index, content, embedding) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING;",
            [chunk.id, chunk.documentId, chunk.chunkIndex, chunk.content, `[${embedding.join(",")}]`]
          );
        }
        return;
      } catch (err) {
        console.warn("Postgres error in addDocumentChunks, falling back to JSON:", err);
      }
    }
    const db = this.readJsonDb();
    db.document_chunks.push(...chunks);
    this.writeJsonDb(db);
  }

  public async getDocumentChunks(documentId: string): Promise<DbChunk[]> {
    await this.initialize();
    if (this.pgPool) {
      try {
        const res = await this.pgPool.query("SELECT * FROM document_chunks WHERE document_id = $1 ORDER BY chunk_index ASC;", [documentId]);
        return res.rows.map(row => ({
          id: row.id,
          documentId: row.document_id,
          chunkIndex: row.chunk_index,
          content: row.content,
          embedding: this.parsePgVector(row.embedding)
        }));
      } catch (err) {
        console.warn("Postgres error in getDocumentChunks, falling back to JSON:", err);
      }
    }
    return this.readJsonDb().document_chunks.filter((c: DbChunk) => c.documentId === documentId);
  }

  public async getSimilaritySearchResults(queryEmbedding: number[], limit = 4): Promise<Array<{ chunk: DbChunk, similarity: number }>> {
    await this.initialize();
    if (this.pgPool) {
      try {
        const embedDim = process.env.OPENAI_API_KEY ? 1536 : 128;
        const embedding = queryEmbedding.slice(0, embedDim);
        while (embedding.length < embedDim) embedding.push(0);

        const res = await this.pgPool.query(
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
      } catch (err) {
        console.warn("Postgres error in getSimilaritySearchResults, falling back to JSON:", err);
      }
    }
    const chunks = this.readJsonDb().document_chunks;
    const scores = chunks.map((chunk: DbChunk) => {
      const sim = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      return { chunk, similarity: sim };
    });
    return scores.sort((a: any, b: any) => b.similarity - a.similarity).slice(0, limit);
  }

  // --- Project / Run Methods ---
  public async getProjects(): Promise<Record<string, ProjectConfig>> {
    await this.initialize();
    if (this.pgPool) {
      try {
        const res = await this.pgPool.query("SELECT * FROM projects;");
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
      } catch (err) {
        console.warn("Postgres error in getProjects, falling back to JSON:", err);
      }
    }
    return this.readJsonDb().projects;
  }

  public async getProject(id: string): Promise<ProjectConfig | null> {
    await this.initialize();
    if (this.pgPool) {
      try {
        const res = await this.pgPool.query("SELECT * FROM projects WHERE id = $1;", [id]);
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
      } catch (err) {
        console.warn("Postgres error in getProject, falling back to JSON:", err);
      }
    }
    const db = this.readJsonDb();
    return db.projects[id] || null;
  }

  public async saveProject(id: string, proj: ProjectConfig): Promise<void> {
    await this.initialize();
    if (this.pgPool) {
      try {
        await this.pgPool.query(
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
        return;
      } catch (err) {
        console.warn("Postgres error in saveProject, falling back to JSON:", err);
      }
    }
    const db = this.readJsonDb();
    db.projects[id] = proj;
    this.writeJsonDb(db);
  }

  private async getSourcesForProject(projectId: string): Promise<any[]> {
    if (!this.pgPool) return [];
    try {
      const res = await this.pgPool.query("SELECT output FROM projects WHERE id = $1;", [projectId]);
      if (res.rows.length > 0) {
        const output = typeof res.rows[0].output === "string" ? JSON.parse(res.rows[0].output) : res.rows[0].output;
        return output.sources || [];
      }
    } catch {
      // Ignore
    }
    return [];
  }

  // --- Helper Methods ---
  private readJsonDb(): { documents: DocumentItem[], document_chunks: DbChunk[], projects: Record<string, ProjectConfig> } {
    if (this.memoryDb) {
      return this.memoryDb;
    }
    try {
      if (fs.existsSync(JSON_DB_PATH)) {
        this.memoryDb = JSON.parse(fs.readFileSync(JSON_DB_PATH, "utf8"));
        return this.memoryDb!;
      }
    } catch {
      // Ignore read errors
    }
    const defaultData = {
      documents: defaultDocs,
      document_chunks: this.generateDefaultChunks(),
      projects: projectsData
    };
    this.memoryDb = defaultData;
    return defaultData;
  }

  private writeJsonDb(data: any): void {
    this.memoryDb = data;
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.warn("Notice: File system write failed (using in-memory store):", (err as Error).message);
    }
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
