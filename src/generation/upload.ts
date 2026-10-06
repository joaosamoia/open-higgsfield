import { put } from "@vercel/blob/client";

const SERVER_UPLOAD_MAX = 4 * 1024 * 1024;

export async function uploadMedia(file: File): Promise<{ url: string }> {
  if (file.size <= SERVER_UPLOAD_MAX) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await res.json().catch(() => ({}))) as { url?: unknown; error?: unknown };
    if (res.ok && typeof data.url === "string") return { url: data.url };
    throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
  }

  const res = await fetch("/api/blob", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      type: "blob.generate-client-token",
      payload: { pathname: file.name, clientPayload: null, multipart: true },
    }),
  });
  if (!res.ok) throw new Error("Failed to retrieve the client token");
  const { clientToken, pathname } = (await res.json()) as {
    clientToken?: unknown;
    pathname?: unknown;
  };
  if (typeof clientToken !== "string" || typeof pathname !== "string") {
    throw new Error("Failed to retrieve the client token");
  }
  const blob = await put(pathname, file, {
    access: "public",
    token: clientToken,
    multipart: true,
  });
  return { url: blob.url };
}
