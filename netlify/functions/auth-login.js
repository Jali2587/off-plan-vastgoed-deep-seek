// netlify/functions/auth-login.js
import { blobs } from "@netlify/blobs";
const crypto = require("crypto"); // ← VEILIGSTE OPTIE OP NETLIFY

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "POST required" })
      };
    }

    // -------- SAFE PARSE --------
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

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email verplicht" })
      };
    }

    const store = blobs();

    // -------- USERS OPHALEN (BESTAAT OF NIET) --------
    let users = [];
    try {
      users = await store.get("data/users.json", { type: "json" }) || [];
      if (!Array.isArray(users)) users = [];
    } catch {
      users = [];
    }

    // -------- USER ZOEKEN / MAKEN --------
    let user = users.find((u) => u.email === email);

    if (!user) {
      user = {
        id: Date.now(),
        email,
        role: email === "jaap@jlmbusinessholding.com" ? "admin" : "investor",
        createdAt: new Date().toISOString()
      };

      users.push(user);

      // schrijf database terug
      await store.setJSON("data/users.json", users);
    }

    // -------- TOKEN GENEREREN (NETLIFY SAFE) --------
    const token = crypto.randomBytes(32).toString("hex");

    await store.setJSON(`tokens/${token}.json`, {
      email: user.email,
      createdAt: new Date().toISOString()
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user,
        token,
        magicLink: `https://costacapital.pro/?token=${token}`
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        stack: err.stack,
        details: "auth-login fatal error"
      })
    };
  }
};
