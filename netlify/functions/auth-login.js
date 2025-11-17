// netlify/functions/auth-login.js
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

    // -------- SAFE BODY PARSE -------
    let body = {};
    try {
      body = JSON.parse(event.body || "{}");
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" })
      };
    }

    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email verplicht" })
      };
    }

    const store = blobs();
    const blobKey = "data/users.json";

    // -------- USERS LADEN -------
    let users = await store.get(blobKey, { type: "json" });
    if (!users || !Array.isArray(users)) users = [];

    // -------- BESTAAND ACCOUNT? -------
    let user = users.find((u) => u.email === email);

    // -------- NIEUW ACCOUNT -------
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

    // -------- TOKEN GENEREREN -------
    const token = randomBytes(32).toString("hex");

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
        details: "auth-login error"
      })
    };
  }
};
