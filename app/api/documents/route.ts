import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEmbedding } from "@/lib/embeddings";
import type { DocumentItem } from "@/lib/workspace-store";

export const dynamic = "force-dynamic";

// Chunker helper
function chunkText(text: string, size = 500, overlap = 100): string[] {
  const chunks: string[] = [];
  let start = 0;
  const normalizedText = text.replace(/\s+/g, " ").trim();
  
  while (start < normalizedText.length) {
    const end = Math.min(start + size, normalizedText.length);
    chunks.push(normalizedText.slice(start, end));
    if (end === normalizedText.length) break;
    start += size - overlap;
  }
  return chunks;
}

export async function GET() {
  try {
    const docs = await db.getDocuments();
    return NextResponse.json(docs);
  } catch (err: any) {
    console.error("GET documents failed:", err);
    return NextResponse.json({ error: err?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const docId = `doc-${Date.now()}`;
    const name = file.name;
    const size = `${(file.size / 1024).toFixed(1)} KB`;
    const uploadedAt = new Date().toISOString().split("T")[0];

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    let textContent = "";

    // Parse depending on file type
    if (name.endsWith(".pdf")) {
      const pdfModule = await import("pdf-parse");
      const parseFunc = (pdfModule as any).default || pdfModule;
      const parsedPdf = await parseFunc(buffer);
      textContent = parsedPdf.text;
    } else {
      // Default to plain text
      textContent = buffer.toString("utf8");
    }

    if (!textContent || textContent.trim().length === 0) {
      return NextResponse.json({ error: "Document is empty" }, { status: 400 });
    }

    // Save document with status "Processing" first
    const docItem: DocumentItem = {
      id: docId,
      name,
      size,
      uploadedAt,
      status: "Processing",
      chunks: 0,
      content: textContent
    };
    await db.addDocument(docItem);

    // Chunk text
    const textChunks = chunkText(textContent);
    
    // Generate embeddings & build DbChunk items
    const dbChunks = await Promise.all(
      textChunks.map(async (text, idx) => {
        const embedding = await getEmbedding(text);
        return {
          id: `${docId}-chunk-${idx}`,
          documentId: docId,
          chunkIndex: idx,
          content: text,
          embedding
        };
      })
    );

    // Save chunks to database
    await db.addDocumentChunks(dbChunks);

    // Update document status to "Indexed" with chunk count
    docItem.status = "Indexed";
    docItem.chunks = dbChunks.length;
    await db.addDocument(docItem);

    return NextResponse.json(docItem);
  } catch (err: any) {
    console.error("POST document upload failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }

    await db.deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE document failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
