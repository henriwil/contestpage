import { getStore } from "@netlify/blobs";

export async function handler(event) {
  try {
    const store = getStore("participants");
    const clubId = event.queryStringParameters?.clubId;
    if (!clubId) return json(400, { error: "Missing clubId" });

    if (event.httpMethod === "GET") {
      let list = [];
      try {
        const data = (await store.get(clubId, { type: "json" })) || [];
        list = Array.isArray(data) ? data : [];
      } catch (e) {
        // Try raw read & log, then fallback
        const raw = await store.get(clubId);
        console.error(`participants GET: invalid JSON for club ${clubId}`, { raw });
        list = [];
      }
      return json(200, list);
    }

    if (event.httpMethod === "POST") {
      const body = safeParse(event.body) || {};
      let list;
      try {
        const current = (await store.get(clubId, { type: "json" })) || [];
        list = Array.isArray(current) ? current : [];
      } catch {
        list = [];
      }
      if (!body.id) body.id = Date.now().toString();
      list.push(body);
      await store.setJSON(clubId, list);
      return json(200, { ok: true, participants: list });
    }

    if (event.httpMethod === "PUT") {
      const body = safeParse(event.body) || {};
      let list;
      try {
        const current = (await store.get(clubId, { type: "json" })) || [];
        list = Array.isArray(current) ? current : [];
      } catch {
        list = [];
      }
      list = list.map((p) => (p.id === body.id ? body : p));
      await store.setJSON(clubId, list);
      return json(200, { ok: true, participants: list });
    }

    if (event.httpMethod === "DELETE") {
      const body = safeParse(event.body) || {};
      let list;
      try {
        const current = (await store.get(clubId, { type: "json" })) || [];
        list = Array.isArray(current) ? current : [];
      } catch {
        list = [];
      }
      list = list.filter((p) => p.id !== body.id);
      await store.setJSON(clubId, list);
      return json(200, { ok: true, participants: list });
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    console.error("participants error:", err);
    return json(500, { error: err.message });
  }
}

function safeParse(s) {
  try { return JSON.parse(s || "{}"); } catch { return null; }
}
function json(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
