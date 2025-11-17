// netlify/functions/auth-register.js
import { blobs } from "@netlify/blobs";
import { randomBytes } from "crypto";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "POST required" })
      };
    }

    // -------- SAFE JSON PARSE --------
    let body = {};
    try {
      body = JSON.parse(event.body || "{}");
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" })
      };
    }

    const email = (body.email || "").trim().toLowerCase();
    const role = body.role || "investor";

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email verplicht" })
      };
    }

    const store = blobs();
    const blobKey = "data/users.json";

    // -------- USERS LADEN --------
    let users = await store.get(blobKey, { type: "json" });
    if (!users || !Array.isArray(users)) users = [];

    // -------- BESTAAND ACCOUNT? --------
    let user = users.find((u) => u.email === email);

    if (user) {
      // bestaande gebruiker → nieuwe token genereren
      const token = randomBytes(32).toString("hex");

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          user,
          token
        })
      };
    }

    // -------- NIEUW ACCOUNT AANMAKEN --------
    const newUser = {
      id: Date.now(),
      email,
      role: email === "jaap@jlmbusinessholding.com" ? "admin" : role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // -------- OPSLAAN --------
    await store.setJSON(blobKey, users);

    // -------- TOKEN GENEREREN --------
    const token = randomBytes(32).toString("hex");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user: newUser,
        token
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        stack: err.stack,
        details: "auth-register error"
      })
    };
  }
};
