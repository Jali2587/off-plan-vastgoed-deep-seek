// netlify/functions/save.js
import { blobs } from "@netlify/blobs";

exports.handler = async (event, context) => {
  try {
    const { newData, file } = JSON.parse(event.body);

    const store = blobs();

    // Lees huidige data
    const existingRaw = await store.get(file);
    let existing = existingRaw ? JSON.parse(existingRaw) : [];

    // Voeg het nieuwe object toe
    existing.push(newData);

    // Sla op
    await store.set(file, JSON.stringify(existing, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, saved: newData })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
