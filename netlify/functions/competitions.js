import { getStore } from "@netlify/blobs";

const store = getStore({
  name: "competitions",
  siteID: process.env.NETLIFY_SITE_ID,
  token: process.env.NETLIFY_BLOBS_TOKEN,
});

export async function handler(event) {
  try {
    if (event.httpMethod === "GET") {
      const all = (await store.get("list", { type: "json" })) || {};
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(all),
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!body.id) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Missing id" }),
        };
      }

      const all = (await store.get("list", { type: "json" })) || {};
      all[body.id] = body;
      await store.setJSON("list", all);

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, competition: body }),
      };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err) {
    console.error("competitions error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
}
