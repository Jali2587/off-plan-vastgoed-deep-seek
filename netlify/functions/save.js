// netlify/functions/save.js

import { blobs } from "@netlify/blobs";

export async function handler(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Only POST allowed" })
      };
    }

    const { file, newData } = JSON.parse(event.body);

    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "file parameter missing" })
      };
    }

    const store = blobs();
    const blobKey = `data/${file}`;

    // ⬇️ 1. Lees bestaande data (of maak lege array)
    let existing = [];

    const current = await store.get(blobKey, { type: "json" });

    if (current) {
      existing = current;
    }

    // ⬇️ 2. Nieuwe reservering toevoegen
    existing.push({
      ...newData,
      savedAt: new Date().toISOString()
    });

    // ⬇️ 3. Terugschrijven naar Netlify Blob Storage
    await store.setJSON(blobKey, existing);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        saved: newData,
        totalEntries: existing.length
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "Blob write error"
      })
    };
  }
}
