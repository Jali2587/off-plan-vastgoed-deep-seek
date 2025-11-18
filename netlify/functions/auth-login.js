// netlify/functions/auth-login.js
import { blobs } from "@netlify/blobs";
import crypto from "crypto";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "POST required" })
      };
    }

    // ⛔ SAFETY: body must exist
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No request body received" })
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "JSON parsing failed", raw: event.body })
      };
    }

    const { email } = parsed;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is verplicht" })
      };
    }

    const store = blobs();
    const blobKey = "data/users.json";

    let users = await store.get(blobKey, { type: "json" });
    if (!users) users = [];

    let user = users.find((u) => u.email === email);

    // Gebruiker bestaat niet → nieuw aanmaken
    if (!user) {
      user = {
        id: Date.now(),
        email,
        role: email === "jaap@jlmbusinessholding.com" ? "admin" : "investor",
        createdAt: new Date().toISOString()
      };

      users.push(user);
      await store.setJSON(blobKey, users);
    }

    const token = crypto.randomBytes(32).toString("hex");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user,
        token
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        stack: err.stack,
        details: "auth-login crashed"
      })
    };
  }
};
