import { AwsClient } from "aws4fetch";
import { supabase } from "./supabase";

export type R2UploadFolder = "blog" | "products" | "services" | "site" | "uploads";

export type R2UploadEnv = {
  R2?: R2Bucket;
  CLOUDFLARE_R2_PUBLIC_URL?: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
};

type UploadBody = {
  fileName?: string;
  fileType?: string;
  fileBase64?: string;
  folder?: R2UploadFolder;
};

const allowedFolders = new Set<R2UploadFolder>(["blog", "products", "services", "site", "uploads"]);
const maxFileSizeBytes = 15 * 1024 * 1024;

const sanitizeFileName = (fileName: string) => {
  const withoutPath = fileName.split(/[\\/]/).pop() || "arquivo";

  return (
    withoutPath
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "arquivo"
  );
};

const extensionFromType = (fileType: string) => {
  if (fileType === "image/jpeg") return ".jpg";
  if (fileType === "image/png") return ".png";
  if (fileType === "image/webp") return ".webp";
  if (fileType === "image/gif") return ".gif";
  if (fileType === "video/mp4") return ".mp4";
  if (fileType === "video/webm") return ".webm";
  return "";
};

const buildPublicUrl = (env: R2UploadEnv, keyName: string) => {
  const rawPublicUrl = env.CLOUDFLARE_R2_PUBLIC_URL || (typeof process !== 'undefined' ? process.env.CLOUDFLARE_R2_PUBLIC_URL : undefined);

  if (rawPublicUrl) {
    const base = rawPublicUrl.endsWith("/") ? rawPublicUrl.slice(0, -1) : rawPublicUrl;
    return `${base}/${keyName}`;
  }

  return `/api/uploads/${encodeURIComponent(keyName)}`;
};

// Extrai a key do objeto no R2 a partir de uma URL pública (tanto o formato
// "/api/uploads/<key>" quanto o domínio público configurado em CLOUDFLARE_R2_PUBLIC_URL).
// Retorna null quando a URL não pertence ao nosso bucket (ex: imagem externa/placeholder),
// para que a exclusão seja ignorada nesses casos.
const extractKeyFromUrl = (env: R2UploadEnv, rawUrl?: string): string | null => {
  if (!rawUrl) return null;

  let pathname: string;
  try {
    pathname = new URL(rawUrl, "https://placeholder.invalid").pathname;
  } catch {
    return null;
  }

  const apiMatch = pathname.match(/^\/api\/uploads\/(.+)$/);
  if (apiMatch) {
    try {
      return decodeURIComponent(apiMatch[1]);
    } catch {
      return apiMatch[1];
    }
  }

  const rawPublicUrl = env.CLOUDFLARE_R2_PUBLIC_URL || (typeof process !== 'undefined' ? process.env.CLOUDFLARE_R2_PUBLIC_URL : undefined);
  if (rawPublicUrl) {
    try {
      const publicPath = new URL(rawPublicUrl).pathname.replace(/\/+$/, "");
      if (publicPath && pathname.startsWith(`${publicPath}/`)) {
        return decodeURIComponent(pathname.slice(publicPath.length + 1));
      }
      if (!publicPath && rawUrl.startsWith(rawPublicUrl)) {
        const base = rawPublicUrl.endsWith("/") ? rawPublicUrl : `${rawPublicUrl}/`;
        return decodeURIComponent(rawUrl.slice(base.length));
      }
    } catch {
      // rawPublicUrl inválida, ignora
    }
  }

  return null;
};

const decodeXmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");

// Parser mínimo do XML de resposta do ListObjectsV2 (S3-compatível), usado quando
// a listagem é feita via credenciais S3 (aws4fetch) em vez do binding nativo do R2.
const parseListObjectsXml = (xml: string) => {
  const files: { key: string; size: number; uploaded: string }[] = [];
  const folders: string[] = [];

  const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
  let match: RegExpExecArray | null;
  while ((match = contentsRegex.exec(xml))) {
    const block = match[1];
    const key = block.match(/<Key>([\s\S]*?)<\/Key>/)?.[1];
    const size = block.match(/<Size>([\s\S]*?)<\/Size>/)?.[1];
    const lastModified = block.match(/<LastModified>([\s\S]*?)<\/LastModified>/)?.[1];
    if (key) {
      files.push({
        key: decodeXmlEntities(key),
        size: size ? parseInt(size, 10) : 0,
        uploaded: lastModified || "",
      });
    }
  }

  const prefixRegex = /<CommonPrefixes>\s*<Prefix>([\s\S]*?)<\/Prefix>\s*<\/CommonPrefixes>/g;
  while ((match = prefixRegex.exec(xml))) {
    folders.push(decodeXmlEntities(match[1]));
  }

  const isTruncated = /<IsTruncated>true<\/IsTruncated>/i.test(xml);
  const nextToken = xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/)?.[1] || null;

  return { files, folders, isTruncated, nextToken };
};

async function verifySupabaseToken(token: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      console.error("Supabase Token Verification Error:", error.message);
      return false;
    }
    return !!data.user;
  } catch (e) {
    console.error("Supabase Token Verification Exception:", e);
    return false;
  }
}

export async function handleR2Config(env: R2UploadEnv) {
  const accountId = env.R2_ACCOUNT_ID || (typeof process !== 'undefined' ? process.env.R2_ACCOUNT_ID : undefined);
  const rawPublicUrl = env.CLOUDFLARE_R2_PUBLIC_URL || (typeof process !== 'undefined' ? process.env.CLOUDFLARE_R2_PUBLIC_URL : undefined);
  return Response.json({
    configured: !!env.R2 || !!accountId,
    publicUrlConfigured: !!rawPublicUrl,
  });
}

export async function handleR2Upload(request: Request, env: R2UploadEnv) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Acesso negado. Token de autenticação obrigatório." }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const isValid = await verifySupabaseToken(token);
    if (!isValid) {
      return Response.json({ error: "Token de autenticação inválido ou expirado." }, { status: 401 });
    }

    const body = (await request.json()) as UploadBody;
    const { fileName, fileType, fileBase64 } = body;
    const folder = allowedFolders.has(body.folder || "uploads") ? body.folder || "uploads" : "uploads";

    if (!fileName || !fileType || !fileBase64) {
      return Response.json(
        { error: "Os campos fileName, fileType e fileBase64 sao obrigatorios." },
        { status: 400 },
      );
    }

    if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
      return Response.json({ error: "Envie apenas imagens ou videos." }, { status: 400 });
    }

    
    const accountId = env.R2_ACCOUNT_ID || (typeof process !== 'undefined' ? process.env.R2_ACCOUNT_ID : undefined);
    const accessKeyId = env.R2_ACCESS_KEY_ID || (typeof process !== 'undefined' ? process.env.R2_ACCESS_KEY_ID : undefined);
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY || (typeof process !== 'undefined' ? process.env.R2_SECRET_ACCESS_KEY : undefined);
    
    if (!env.R2 && !(accountId && accessKeyId && secretAccessKey)) {
      return Response.json(
        { error: "O bucket R2 nao esta configurado. Configure o binding R2 no Cloudflare ou as credenciais S3 (R2_ACCOUNT_ID, etc)." },
        { status: 500 },
      );
    }


    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, "");
    const binary = atob(base64Data);

    if (binary.length > maxFileSizeBytes) {
      return Response.json({ error: "Arquivo muito grande. O limite atual e 15 MB." }, { status: 413 });
    }

    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    const sanitizedName = sanitizeFileName(fileName);
    const hasExtension = /\.[a-z0-9]+$/i.test(sanitizedName);
    const finalName = hasExtension ? sanitizedName : `${sanitizedName}${extensionFromType(fileType)}`;
    const keyName = `${folder}/${year}/${month}/${uniqueSuffix}-${finalName}`;

    
    
    if (accountId && accessKeyId && secretAccessKey) {
      console.log("Using aws4fetch for R2 upload...");
      const aws = new AwsClient({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        region: "auto",
        service: "s3",
      });
      const bucketName = env.R2_BUCKET_NAME || (typeof process !== 'undefined' ? process.env.R2_BUCKET_NAME : undefined) || "moraes-revestimento";
      const url = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${keyName}`;
      const res = await aws.fetch(url, {
        method: 'PUT',
        body: bytes,
        headers: {
          'Content-Type': fileType,
          'x-amz-meta-originalName': encodeURIComponent(fileName),
          'x-amz-meta-folder': folder,
        }
      });
      if (!res.ok) {
        throw new Error(`R2 Upload via aws4fetch failed: ${res.status} ${res.statusText} ${await res.text()}`);
      }
    } else if (env.R2) {
      console.log("Using env.R2 binding for R2 upload...");
      await env.R2.put(keyName, bytes, {
        httpMetadata: { contentType: fileType },
        customMetadata: {
          originalName: fileName,
          folder,
        },
      });
    }



    return Response.json({
      success: true,
      url: buildPublicUrl(env, keyName),
      key: keyName,
      message: "Upload para o Cloudflare R2 concluido com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro no processamento do upload do R2:", error);

    return Response.json(
      {
        error: "Falha ao enviar o arquivo para o Cloudflare R2.",
        details: error?.message || "Erro desconhecido.",
      },
      { status: 500 },
    );
  }
}

export async function handleR2Delete(request: Request, env: R2UploadEnv) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Acesso negado. Token de autenticação obrigatório." }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const isValid = await verifySupabaseToken(token);
    if (!isValid) {
      return Response.json({ error: "Token de autenticação inválido ou expirado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { key?: string; url?: string };
    const keyName = body.key || extractKeyFromUrl(env, body.url);

    if (!keyName) {
      // URL não pertence ao bucket R2 (ex: imagem externa/placeholder) — nada a excluir.
      return Response.json({ success: true, skipped: true });
    }

    const accountId = env.R2_ACCOUNT_ID || (typeof process !== 'undefined' ? process.env.R2_ACCOUNT_ID : undefined);
    const accessKeyId = env.R2_ACCESS_KEY_ID || (typeof process !== 'undefined' ? process.env.R2_ACCESS_KEY_ID : undefined);
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY || (typeof process !== 'undefined' ? process.env.R2_SECRET_ACCESS_KEY : undefined);

    if (accountId && accessKeyId && secretAccessKey) {
      const aws = new AwsClient({
        accessKeyId,
        secretAccessKey,
        region: "auto",
        service: "s3",
      });
      const bucketName = env.R2_BUCKET_NAME || (typeof process !== 'undefined' ? process.env.R2_BUCKET_NAME : undefined) || "moraes-revestimento";
      const url = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${keyName}`;
      const res = await aws.fetch(url, { method: "DELETE" });
      if (!res.ok && res.status !== 404) {
        throw new Error(`R2 Delete via aws4fetch failed: ${res.status} ${res.statusText} ${await res.text()}`);
      }
    } else if (env.R2) {
      await env.R2.delete(keyName);
    } else {
      return Response.json(
        { error: "O bucket R2 nao esta configurado. Configure o binding R2 no Cloudflare ou as credenciais S3 (R2_ACCOUNT_ID, etc)." },
        { status: 500 },
      );
    }

    return Response.json({ success: true, key: keyName });
  } catch (error: any) {
    console.error("Erro ao excluir arquivo do R2:", error);
    return Response.json(
      {
        error: "Falha ao excluir o arquivo do Cloudflare R2.",
        details: error?.message || "Erro desconhecido.",
      },
      { status: 500 },
    );
  }
}

export async function handleR2List(request: Request, env: R2UploadEnv) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Acesso negado. Token de autenticação obrigatório." }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const isValid = await verifySupabaseToken(token);
    if (!isValid) {
      return Response.json({ error: "Token de autenticação inválido ou expirado." }, { status: 401 });
    }

    const requestUrl = new URL(request.url);
    const rawPrefix = (requestUrl.searchParams.get("prefix") || "").replace(/^\/+/, "");
    const prefix = rawPrefix && !rawPrefix.endsWith("/") ? `${rawPrefix}/` : rawPrefix;
    const cursor = requestUrl.searchParams.get("cursor") || undefined;

    // Só agrupamos por "/" na raiz, onde cada pasta representa uma área de upload
    // (produtos, blog, site...). Dentro delas, os uploads criam automaticamente
    // subcaminhos por ano/mês — em vez de expor esse nível como pastas navegáveis,
    // listamos tudo de forma recursiva e só tratamos como "pasta" o que o usuário
    // criou manualmente (via marcador .folder, ver handleR2CreateFolder).
    const isRoot = prefix === "";

    const accountId = env.R2_ACCOUNT_ID || (typeof process !== 'undefined' ? process.env.R2_ACCOUNT_ID : undefined);
    const accessKeyId = env.R2_ACCESS_KEY_ID || (typeof process !== 'undefined' ? process.env.R2_ACCESS_KEY_ID : undefined);
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY || (typeof process !== 'undefined' ? process.env.R2_SECRET_ACCESS_KEY : undefined);

    let rawFiles: { key: string; size: number; uploaded: string }[] = [];
    let rawFolders: string[] = [];
    let truncated = false;
    let nextCursor: string | null = null;

    if (accountId && accessKeyId && secretAccessKey) {
      const aws = new AwsClient({ accessKeyId, secretAccessKey, region: "auto", service: "s3" });
      const bucketName = env.R2_BUCKET_NAME || (typeof process !== 'undefined' ? process.env.R2_BUCKET_NAME : undefined) || "moraes-revestimento";
      const listUrl = new URL(`https://${bucketName}.${accountId}.r2.cloudflarestorage.com/`);
      listUrl.searchParams.set("list-type", "2");
      if (isRoot) listUrl.searchParams.set("delimiter", "/");
      listUrl.searchParams.set("max-keys", "1000");
      if (prefix) listUrl.searchParams.set("prefix", prefix);
      if (cursor) listUrl.searchParams.set("continuation-token", cursor);

      const res = await aws.fetch(listUrl.toString(), { method: "GET" });
      if (!res.ok) {
        throw new Error(`R2 List via aws4fetch failed: ${res.status} ${res.statusText} ${await res.text()}`);
      }
      const xml = await res.text();
      const parsed = parseListObjectsXml(xml);
      rawFiles = parsed.files;
      rawFolders = parsed.folders;
      truncated = parsed.isTruncated;
      nextCursor = parsed.nextToken;
    } else if (env.R2) {
      const listing = await env.R2.list({ prefix, delimiter: isRoot ? "/" : undefined, cursor, limit: 1000 });
      rawFiles = listing.objects.map((o) => ({ key: o.key, size: o.size, uploaded: o.uploaded.toISOString() }));
      rawFolders = listing.delimitedPrefixes ?? [];
      truncated = listing.truncated;
      nextCursor = listing.truncated ? listing.cursor : null;
    } else {
      return Response.json(
        { error: "O bucket R2 nao esta configurado. Configure o binding R2 no Cloudflare ou as credenciais S3 (R2_ACCOUNT_ID, etc)." },
        { status: 500 },
      );
    }

    const markerSuffix = "/.folder";
    let folders: string[];
    let files: { key: string; url: string; size: number; uploaded: string }[];

    if (isRoot) {
      folders = rawFolders.filter((f) => f !== prefix).sort();
      files = rawFiles
        .filter((f) => !f.key.endsWith(markerSuffix))
        .map((f) => ({ key: f.key, url: buildPublicUrl(env, f.key), size: f.size, uploaded: f.uploaded }))
        .sort((a, b) => b.uploaded.localeCompare(a.uploaded));
    } else {
      // Pastas "reais" = apenas os subcaminhos diretos que contêm um marcador .folder
      // (criados via "Nova Pasta"). Tudo mais (ex: caminhos automáticos de ano/mês)
      // é achatado e mostrado como arquivo direto neste nível.
      const realFolderSet = new Set<string>();
      for (const f of rawFiles) {
        if (!f.key.endsWith(markerSuffix)) continue;
        const relative = f.key.slice(prefix.length);
        const firstSegment = relative.split("/")[0];
        if (firstSegment) realFolderSet.add(`${prefix}${firstSegment}/`);
      }

      folders = Array.from(realFolderSet).sort();
      files = rawFiles
        .filter((f) => {
          if (f.key.endsWith(markerSuffix)) return false;
          const relative = f.key.slice(prefix.length);
          const firstSegment = relative.split("/")[0];
          return !realFolderSet.has(`${prefix}${firstSegment}/`);
        })
        .map((f) => ({ key: f.key, url: buildPublicUrl(env, f.key), size: f.size, uploaded: f.uploaded }))
        .sort((a, b) => b.uploaded.localeCompare(a.uploaded));
    }

    return Response.json({ prefix, folders, files, truncated, cursor: nextCursor });
  } catch (error: any) {
    console.error("Erro ao listar arquivos do R2:", error);
    return Response.json(
      {
        error: "Falha ao listar arquivos do Cloudflare R2.",
        details: error?.message || "Erro desconhecido.",
      },
      { status: 500 },
    );
  }
}

export async function handleR2CreateFolder(request: Request, env: R2UploadEnv) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Acesso negado. Token de autenticação obrigatório." }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const isValid = await verifySupabaseToken(token);
    if (!isValid) {
      return Response.json({ error: "Token de autenticação inválido ou expirado." }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { prefix?: string; name?: string };
    const parentPrefix = (body.prefix || "").replace(/^\/+/, "");
    const rawName = (body.name || "").trim();

    if (!rawName) {
      return Response.json({ error: "Informe um nome para a pasta." }, { status: 400 });
    }

    const sanitizedName = rawName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    if (!sanitizedName) {
      return Response.json({ error: "Nome de pasta inválido." }, { status: 400 });
    }

    const folderPrefix = `${parentPrefix}${sanitizedName}/`;
    const folderKey = `${folderPrefix}.folder`;

    const accountId = env.R2_ACCOUNT_ID || (typeof process !== 'undefined' ? process.env.R2_ACCOUNT_ID : undefined);
    const accessKeyId = env.R2_ACCESS_KEY_ID || (typeof process !== 'undefined' ? process.env.R2_ACCESS_KEY_ID : undefined);
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY || (typeof process !== 'undefined' ? process.env.R2_SECRET_ACCESS_KEY : undefined);

    if (accountId && accessKeyId && secretAccessKey) {
      const aws = new AwsClient({ accessKeyId, secretAccessKey, region: "auto", service: "s3" });
      const bucketName = env.R2_BUCKET_NAME || (typeof process !== 'undefined' ? process.env.R2_BUCKET_NAME : undefined) || "moraes-revestimento";
      const putUrl = `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${folderKey}`;
      const res = await aws.fetch(putUrl, {
        method: "PUT",
        body: new Uint8Array(0),
        headers: { "Content-Type": "application/x-directory" },
      });
      if (!res.ok) {
        throw new Error(`R2 create folder via aws4fetch failed: ${res.status} ${res.statusText} ${await res.text()}`);
      }
    } else if (env.R2) {
      await env.R2.put(folderKey, new Uint8Array(0), { httpMetadata: { contentType: "application/x-directory" } });
    } else {
      return Response.json(
        { error: "O bucket R2 nao esta configurado. Configure o binding R2 no Cloudflare ou as credenciais S3 (R2_ACCOUNT_ID, etc)." },
        { status: 500 },
      );
    }

    return Response.json({ success: true, prefix: folderPrefix });
  } catch (error: any) {
    console.error("Erro ao criar pasta no R2:", error);
    return Response.json(
      {
        error: "Falha ao criar pasta no Cloudflare R2.",
        details: error?.message || "Erro desconhecido.",
      },
      { status: 500 },
    );
  }
}

export async function handleR2File(request: Request, env: R2UploadEnv) {
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/api\/uploads\//, ""));

  if (!key) {
    return new Response("Arquivo nao informado", { status: 400 });
  }

  if (!env.R2) {
    return new Response("R2 nao configurado", { status: 404 });
  }

  const object = await env.R2.get(key);

  if (object === null) {
    return new Response("Arquivo nao encontrado", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
