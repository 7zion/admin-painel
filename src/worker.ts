import server from "@tanstack/react-start/server-entry";
import { handleR2Config, handleR2CreateFolder, handleR2Delete, handleR2File, handleR2List, handleR2Upload, type R2UploadEnv } from "./lib/r2-upload.server";
import { handleGeminiChat } from "./lib/gemini-chat.server";
import { handleSitemap } from "./lib/sitemap.server";
import { handleMetaCapiEvent } from "./lib/meta-capi.server";

type WorkerEnv = R2UploadEnv;

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/upload") {
      return handleR2Upload(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/upload/delete") {
      return handleR2Delete(request, env);
    }

    if (request.method === "GET" && url.pathname === "/api/media/list") {
      return handleR2List(request, env);
    }

    if (request.method === "POST" && url.pathname === "/api/media/folder") {
      return handleR2CreateFolder(request, env);
    }
    
    if (request.method === "POST" && url.pathname === "/api/gemini/chat") {
      return handleGeminiChat(request);
    }

    if (request.method === "POST" && url.pathname === "/api/meta-capi/event") {
      return handleMetaCapiEvent(request);
    }

    if (request.method === "GET" && url.pathname === "/sitemap.xml") {
      return handleSitemap();
    }

    if (request.method === "GET" && url.pathname === "/api/config/r2") {
      return handleR2Config(env);
    }

    if (request.method === "GET" && url.pathname.startsWith("/api/uploads/")) {
      return handleR2File(request, env);
    }

    const fetchApp = server.fetch as unknown as (request: Request, env: WorkerEnv, ctx: ExecutionContext) => Promise<Response>;
    return fetchApp(request, env, ctx);
  },
};
