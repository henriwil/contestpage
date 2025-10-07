import { getStore } from "@netlify/blobs";

// Either use injected env (prod) or manual fallback
const store =
  process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN
    ? getStore({
        name: "competitions",
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN,
      })
    : getStore("competitions");

export async function handler(event) {
  try {
    if (event.httpMethod === "GET") {
      const all = (await store.get("list", { type: "json" })) || {};
      return { statusCode: 200, body: JSON.stringify(all) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!body.id) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };
      }

      let all = (await store.get("list", { type: "json" })) || {};
      all[body.id] = body;
      await store.setJSON("list", all);

      return { statusCode: 200, body: JSON.stringify({ ok: true, competition: body }) };
    }
      // ✅ NY DEL: håndter sletting
  if (event.httpMethod === "DELETE") {
  try {
    const { id } = JSON.parse(event.body);
    if (!id) return { statusCode: 400, body: "Missing id" };

    console.log("🗑️ Deleting competition:", id);
    const store = await blobs("competitions");
    const exists = await store.get(id);

    if (!exists) {
      return { statusCode: 404, body: "Competition not found: " + id };
    }

    await store.delete(id);
    return { statusCode: 200, body: JSON.stringify({ ok: true, deleted: id }) };
  } catch (err) {
    console.error("Delete error:", err);
    return { statusCode: 500, body: "Error deleting: " + err.message };
  }
}

    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  } catch (err) {
    console.error("competitions error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
