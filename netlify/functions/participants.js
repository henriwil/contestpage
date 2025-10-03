// netlify/functions/participants.js
import { getStore } from "@netlify/blobs";

const store = getStore({ name: "participants" }); 

export async function handler(event) {
  try {
    const clubId = event.queryStringParameters?.clubId;
    if (!clubId) return { statusCode: 400, body: "Missing clubId" };

    if (event.httpMethod === "GET") {
      const list = (await store.get(clubId, { type: "json" })) || [];
      return { statusCode: 200, body: JSON.stringify(list) };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      const list = (await store.get(clubId, { type: "json" })) || [];
      if (!body.id) body.id = Date.now().toString();
      list.push(body);
      await store.setJSON(clubId, list);
      return { statusCode: 200, body: JSON.stringify({ ok: true, participants: list }) };
    }

    if (event.httpMethod === "DELETE") {
      const body = JSON.parse(event.body || "{}");
      let list = (await store.get(clubId, { type: "json" })) || [];
      list = list.filter((p) => p.id !== body.id);
      await store.setJSON(clubId, list);
      return { statusCode: 200, body: JSON.stringify({ ok: true, participants: list }) };
    }

    return { statusCode: 405, body: "Method not allowed" };
  } catch (err) {
    console.error("participants error:", err);
    return { statusCode: 500, body: "Server error: " + err.message };
  }
}
