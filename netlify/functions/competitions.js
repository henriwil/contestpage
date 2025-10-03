import { getStore } from "@netlify/blobs";

// Use injected env in prod OR manual config if needed
const store =
  process.env.NETLIFY_SITE_ID && process.env.NETLIFY_BLOBS_TOKEN
    ? getStore({
        name: "competitions",
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_BLOBS_TOKEN,
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
        return { statusCode: 400, body: "Missing competition id" };
      }
      let all = (await store.get("list", { type: "json" })) || {};
      all[body.id] = body;
      await store.setJSON("list", all);
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true, competition: body }),
      };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err) {
    console.error("competitions error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Unknown error" }),
    };
  }
}
