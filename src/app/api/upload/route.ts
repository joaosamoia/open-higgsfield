import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

const ALLOWED = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "audio/wav", "audio/x-wav",
]);
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN ?? process.env.OPEN_HIGGSFIELD_READ_WRITE_TOKEN;
  if (!token) return NextResponse.json({ error: "Blob not configured" }, { status: 500 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "File type not allowed" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File too large" }, { status: 413 });

  const safeName =
    file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "_")
      .slice(-80) || "upload";
  const blob = await put(`uploads/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
    token,
  });
  return NextResponse.json({ url: blob.url });
}
