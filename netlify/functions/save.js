// netlify/functions/save.js
const { blobs } = require("@netlify/blobs");

exports.handler = async (event, context) => {
  try {
    // Method check
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Only POST allowed" })
      };
    }

    // Parse body safely
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" })
      };
    }

    const { file, newData } = body;

    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'file' parameter" })
      };
    }

    if (!newData || typeof newData !== "object") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "newData must be a JSON object" })
      };
    }

    const store = blobs();
    const blobKey = `data/${file}`;

    // 1. Lees bestaande JSON veilig
    let existing = [];
    try {
      const current = await store.get(blobKey, { type: "json" });
      if (Array.isArray(current)) {
        existing = current;
      }
    } catch (e) {
      // ignore — start fresh
    }

    // 2. Veilige merge zonder undefined
    const entry = {
      ...newData,
      savedAt: new Date().toISOString()
    };

    existing.push(entry);

    // 3. Terugschrijven
    await store.setJSON(blobKey, existing);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        saved: entry,
        total: existing.length
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "Blob write error (safe handler)"
      })
    };
  }
};
