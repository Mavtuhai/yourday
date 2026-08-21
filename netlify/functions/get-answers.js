const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const password = (event.queryStringParameters && event.queryStringParameters.password) || "";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ADMIN_PASSWORD belum diset di Environment Variables Netlify" })
    };
  }

  if (password !== adminPassword) {
    return { statusCode: 401, body: JSON.stringify({ error: "Password salah" }) };
  }

  try {
    const store = getStore({
      name: "kado-jawaban",
      siteID: process.env.NETLIFY_SITE_ID,
      token: process.env.NETLIFY_BLOBS_TOKEN
    });
    const { blobs } = await store.list();
    const records = [];
    for (const b of blobs) {
      const val = await store.get(b.key, { type: "json" });
      if (val) records.push(val);
    }
    records.sort((a, c) => new Date(c.timestamp) - new Date(a.timestamp));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
