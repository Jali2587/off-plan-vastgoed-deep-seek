// netlify/functions/auth-register.js
import { blobs } from "@netlify/blobs";
import crypto from "crypto";

export const handler = async (event) => {
  try {
    const { email, role } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email verplicht" })
      };
    }

    const store = blobs();
    const blobKey = "data/users.json";

    let users = await store.get(blobKey, { type: "json" });
    if (!users) users = [];

    let existing = users.find((u) => u.email === email);

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

    const newUser = {
      id: Date.now(),
      email,
      role: role || "investor",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
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
