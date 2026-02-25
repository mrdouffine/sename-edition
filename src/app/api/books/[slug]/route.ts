import { NextResponse } from "next/server";
import { getBookBySlug } from "@/lib/services/bookService";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: book });
}
