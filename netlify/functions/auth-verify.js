// netlify/functions/auth-verify.js
import { blobs } from "@netlify/blobs";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "POST required" })
      };
    }

    // ------------ SAFE PARSE ------------
    let body = {};
    try {
      body = JSON.parse(event.body || "{}");
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" })
      };
    }

    const token = body.token;
    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Token ontbreekt" })
      };
    }

    // 👉 In deze eenvoudige setup validatie = check dat token bestaat
    // We koppelen tokens NIET aan users (is niet nodig)
    // Frontend bewaart user info zelf in localStorage.

    // We returnen alleen "success"
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        stack: err.stack,
        details: "auth-verify error"
      })
    };
  }
};
