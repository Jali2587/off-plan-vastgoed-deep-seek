// netlify/functions/auth-profile.js

import jwt from "jsonwebtoken";
import { loadJSON } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    const authHeader = event.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Geen geldige autorisatie header." })
      };
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // Token decoderen
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "JWT verificatie mislukt." })
      };
    }

    if (!decoded.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "JWT bevat geen email." })
      };
    }

    // User ophalen uit `/data/users.json`
    const users = loadJSON("users.json");
    const user = users.find((u) => u.email === decoded.email);

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Gebruiker niet gevonden." })
      };
    }

    // Succes!
    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        user
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "auth-profile error"
      })
    };
  }
};
