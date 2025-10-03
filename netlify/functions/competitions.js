import { getStore } from "@netlify/blobs";

export async function handler(event) {
  try {
    const store = getStore("competitions");

    if (event.httpMethod === "GET") {
      // Defensive read: if JSON is corrupt, fall back to {}
      let all = {};
      try {
        all = (await store.get("list", { type: "json" })) || {};
      } catch (e) {
        // Try raw read & log, then fallback
        const raw = await store.get("list");
        console.error("competitions GET: invalid JSON in 'list'", { raw });
        all = {};
      }
      return json(200, all);
    }

    if (event.httpMethod === "POST") {
      const body = safeParse(event.body);
      if (!body?.id) return json(400, { error: "Missing id" });

      // Load current map defensively
      let all = {};
      try {
        all = (await store.get("list", { type: "json" })) || {};
      } catch {
        all = {};
      }

      all[body.id] = body;
      await store.setJSON("list", all);
      return json(200, { ok: true, competition: body });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    console.error("competitions error:", err);
    return json(500, { error: err.message });
  }
}

function safeParse(s) {
  try { return JSON.parse(s || "{}"); } catch { return null; }
}
function json(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
