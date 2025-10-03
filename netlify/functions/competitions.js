import { getStore } from "@netlify/blobs";

export async function handler(event) {
  try {
    // Initialize inside the handler, so env vars are available
    const store = getStore({
      name: "competitions",                       // store name (auto-created on first write)
      siteID: process.env.NETLIFY_SITE_ID,        // from environment
      token: process.env.NETLIFY_BLOBS_TOKEN,     // from environment
    });

    if (event.httpMethod === "GET") {
      const all = (await store.get("list", { type: "json" })) || {};
      return { statusCode: 200, body: JSON.stringify(all) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!body.id) {
        return { statusCode: 400, body: "Missing id" };
      }

      const all = (await store.get("list", { type: "json" })) || {};
      all[body.id] = body;

      await store.setJSON("list", all);

      return { statusCode: 200, body: JSON.stringify({ ok: true, competition: body }) };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err) {
    console.error("competitions error:", err);
    return { statusCode: 500, body: "Server error: " + err.message };
  }
}