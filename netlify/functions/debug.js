import { getStore } from "@netlify/blobs";

export async function handler() {
  try {
    const store = getStore("competitions");
    const key = "__healthcheck__";
    const payload = { ts: Date.now() };
    await store.setJSON(key, payload);
    const back = await store.get(key, { type: "json" });
    return json(200, { ok: true, wrote: !!back, back });
  } catch (e) {
    return json(500, { ok: false, error: e.message });
  }
}
function json(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
