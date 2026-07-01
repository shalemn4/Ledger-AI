import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await db.getProjects();
    return NextResponse.json(projects);
  } catch (err: any) {
    console.error("GET projects failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
