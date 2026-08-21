const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: "Body tidak valid" }) };
  }

  if (!data.id) {
    return { statusCode: 400, body: JSON.stringify({ error: "id wajib diisi" }) };
  }

  const record = {
    id: String(data.id),
    status: data.status === "free" || data.status === "tidak" ? data.status : "pending",
    waktu: (data.waktu || "").toString().slice(0, 500),
    baju: (data.baju || "").toString().slice(0, 200),
    bajuRequest: (data.bajuRequest || "").toString().slice(0, 500),
    timestamp: new Date().toISOString()
  };

  try {
    const store = getStore({
      name: "kado-jawaban",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    await store.setJSON(record.id, record);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
