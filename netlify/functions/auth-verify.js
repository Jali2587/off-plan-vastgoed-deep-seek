// netlify/functions/auth-verify.js

import jwt from "jsonwebtoken";
import { loadJSON } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    const auth = event.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Geen geldige autorisatie header." })
      };
    }

    const token = auth.replace("Bearer ", "").trim();

    // JWT verifiëren
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.email) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "JWT onvolledig of ongeldig." })
      };
    }

    // User ophalen uit JSON datastore
    const users = loadJSON("users.json");
    const user = users.find((u) => u.email === decoded.email);

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Gebruiker niet gevonden." })
      };
    }

    // Alles ok → stuur gebruiker terug
    return {
      statusCode: 200,
      body: JSON.stringify({
        valid: true,
        user
      })
    };

  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        valid: false,
        error: "JWT verificatie mislukt.",
        details: err.message
      })
    };
  }
};
