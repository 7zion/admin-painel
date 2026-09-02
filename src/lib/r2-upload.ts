import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

export type R2UploadFolder = "blog" | "products" | "services" | "site" | "categories";

type UploadResponse = {
  success?: boolean;
  url?: string;
  key?: string;
  error?: string;
  details?: string;
};

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo selecionado."));
    reader.readAsDataURL(file);
  });

export async function uploadFileToR2(file: File, folder: R2UploadFolder): Promise<string> {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    throw new Error("Envie apenas imagens ou videos.");
  }

  let finalFile = file;

  // Se for imagem e não for SVG/GIF animado, vamos tentar comprimir e converter para webp
  if (file.type.startsWith("image/") && file.type !== "image/svg+xml" && file.type !== "image/gif") {
    try {
      const options = {
        maxSizeMB: 1, // Limita a 1MB
        maxWidthOrHeight: 1920, // Limita a resolução máxima
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.8
      };
      
      const compressedBlob = await imageCompression(file, options);
      
      // Cria um novo File com a extensao alterada para .webp
      const newFileName = file.name.replace(/.[^/.]+$/, "") + ".webp";
      finalFile = new File([compressedBlob], newFileName, {
        type: "image/webp",
      });
    } catch (error) {
      console.warn("Falha ao comprimir imagem. Enviando original.", error);
      // Fallback: mantém o file original
    }
  }

  const fileBase64 = await fileToDataUrl(finalFile);

  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token ?? null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch("/api/upload", {
    method: "POST",
    headers,
    body: JSON.stringify({
      fileName: finalFile.name,
      fileType: finalFile.type,
      fileBase64,
      folder,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as UploadResponse;

  if (!response.ok || !data.success || !data.url) {
    throw new Error(data.error || data.details || "Falha ao enviar o arquivo para o Cloudflare R2.");
  }

  return data.url;
}

// Exclui um arquivo do R2 a partir da sua URL pública. Best-effort: URLs que não
// pertencem ao bucket (ex: imagens externas/placeholder) são ignoradas pelo servidor,
// e falhas de rede/exclusão são apenas logadas para não travar o fluxo do usuário.
export async function deleteFileFromR2(url?: string | null): Promise<void> {
  if (!url) return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token ?? null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch("/api/upload/delete", {
      method: "POST",
      headers,
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      console.error("Falha ao excluir arquivo do R2:", data.error || response.statusText);
    }
  } catch (error) {
    console.error("Erro de rede ao excluir arquivo do R2:", error);
  }
}

export type R2MediaFile = {
  key: string;
  url: string;
  size: number;
  uploaded: string;
};

export type R2MediaListing = {
  prefix: string;
  folders: string[];
  files: R2MediaFile[];
  truncated: boolean;
  cursor: string | null;
};

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token ?? null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  return headers;
}

export async function listR2Media(prefix: string = "", cursor?: string): Promise<R2MediaListing> {
  const headers = await authHeaders();
  const params = new URLSearchParams();
  if (prefix) params.set("prefix", prefix);
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(`/api/media/list?${params.toString()}`, { headers });
  const data = (await response.json().catch(() => ({}))) as R2MediaListing & { error?: string; details?: string };

  if (!response.ok) {
    throw new Error(data.error || data.details || "Falha ao listar arquivos do Cloudflare R2.");
  }

  return data;
}

export async function createR2Folder(prefix: string, name: string): Promise<string> {
  const headers = await authHeaders();
  const response = await fetch("/api/media/folder", {
    method: "POST",
    headers,
    body: JSON.stringify({ prefix, name }),
  });
  const data = (await response.json().catch(() => ({}))) as { success?: boolean; prefix?: string; error?: string; details?: string };

  if (!response.ok || !data.success || !data.prefix) {
    throw new Error(data.error || data.details || "Falha ao criar pasta no Cloudflare R2.");
  }

  return data.prefix;
}

export async function deleteR2ObjectByKey(key: string): Promise<void> {
  const headers = await authHeaders();
  const response = await fetch("/api/upload/delete", {
    method: "POST",
    headers,
    body: JSON.stringify({ key }),
  });
  const data = (await response.json().catch(() => ({}))) as { success?: boolean; error?: string; details?: string };

  if (!response.ok || !data.success) {
    throw new Error(data.error || data.details || "Falha ao excluir arquivo do Cloudflare R2.");
  }
}
