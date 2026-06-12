async function loadIndex(env) {
  const resp = await env.ASSETS.fetch("/skills/.skills-index.json");
  if (!resp.ok) return null;
  return resp.json();
}

function sendJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function sendText(body, status = 200) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const segments = url.pathname.replace("/api/skills/", "").split("/").filter(Boolean);
  const slug = segments[0];
  const action = segments[1];

  const index = await loadIndex(env);
  if (!index) {
    return sendJson({ error: "skills index not found" }, 500);
  }

  if (!slug) {
    return sendJson({ skills: index.skills });
  }

  if (!index.entries[slug]) {
    return sendJson({ error: `技能未找到：${slug}` }, 404);
  }

  if (action === "raw") {
    const filePath = url.searchParams.get("path") ?? "";
    if (!filePath || filePath.includes("..")) {
      return sendJson({ error: "invalid path" }, 400);
    }
    const fileResp = await env.ASSETS.fetch(`/skills/${slug}/${filePath}`);
    if (!fileResp.ok) {
      return sendJson({ error: `文件不存在：${filePath}` }, 404);
    }
    return sendText(await fileResp.text());
  }

  if (action === "files") {
    const sub = url.searchParams.get("path") ?? "";
    const entries = index.entries[slug]?.[sub] ?? [];
    return sendJson({ entries });
  }

  if (!action) {
    const entries = index.entries[slug]?.[""] ?? [];
    return sendJson({ slug, entries });
  }

  return sendJson({ error: "不支持的子操作" }, 404);
}
