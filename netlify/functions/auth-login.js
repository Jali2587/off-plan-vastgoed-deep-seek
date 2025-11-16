// netlify/functions/auth-login.js
import { blobs } from "@netlify/blobs";
import crypto from "crypto";

export const handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);
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

    let user = users.find((u) => u.email === email);

    // Nieuw account indien niet bestaat
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
        details: "auth-login error"
      })
    };
  }
};
