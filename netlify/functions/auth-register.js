// netlify/functions/auth-register.js
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

    const { email, role } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is verplicht." })
      };
    }

    const store = blobs();
    const blobKey = "data/users.json";

    // 1️⃣ Lees bestaande gebruikers
    let users = await store.get(blobKey, { type: "json" });
    if (!users) users = [];

    // 2️⃣ Bestaat gebruiker al?
    const existing = users.find((u) => u.email === email);
    if (existing) {
      const token = crypto.randomBytes(32).toString("hex");
      return {
        statusCode: 200,
        body: JSON.stringify({
          user: existing,
          token
        })
      };
    }

    // 3️⃣ Nieuwe gebruiker
    const newUser = {
      id: Date.now(),
      email,
      role: role || "investor",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // 4️⃣ Opslaan in Netlify Blobs
    await store.setJSON(blobKey, users);

    const token = crypto.randomBytes(32).toString("hex");

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: newUser,
        token
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "auth-register error"
      })
    };
  }
};
