import { getStore } from "@netlify/blobs";

export async function handler(event) {
  const store = getStore("clubs");

  if (event.httpMethod === "GET") {
    const list = await store.get("list", { type: "json" }) || [];
    return { statusCode: 200, body: JSON.stringify(list) };
  }

  if (event.httpMethod === "POST") {
    const body = JSON.parse(event.body || "{}");
    let list = await store.get("list", { type: "json" }) || [];
    // legg til ny club
    if (!body.id) body.id = Date.now().toString();
    list.push(body);
    await store.setJSON("list", list);
    return { statusCode: 200, body: JSON.stringify({ ok:true, clubs:list }) };
  }

  if (event.httpMethod === "PUT") {
    // oppdaterer eksisterende
    const body = JSON.parse(event.body || "{}");
    let list = await store.get("list", { type: "json" }) || [];
    list = list.map(cl => cl.id === body.id ? body : cl);
    await store.setJSON("list", list);
    return { statusCode: 200, body: JSON.stringify({ ok:true, clubs:list }) };
  }

  if (event.httpMethod === "DELETE") {
    const body = JSON.parse(event.body || "{}");
    let list = await store.get("list", { type: "json" }) || [];
    list = list.filter(cl => cl.id !== body.id);
    await store.setJSON("list", list);
    return { statusCode: 200, body: JSON.stringify({ ok:true, clubs:list }) };
  }

  return { statusCode: 405, body: "Method not allowed" };
}