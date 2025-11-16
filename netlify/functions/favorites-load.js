// netlify/functions/favorites-load.js

import jwt from "jsonwebtoken";
import { loadJSON } from "./lib/helpers.js";

export const handler = async (event) => {
  try {

    // -------------------------------
    // AUTHENTICATIE CONTROLEREN
    // -------------------------------
    const authHeader = event.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Geen geldige autorisatie header." })
      };
    }

    const token = authHeader.replace("Bearer ", "").trim();

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "JWT verificatie mislukt." })
      };
    }

    const userEmail = decoded.email;


    // -------------------------------
    // FAVORIETEN LADEN
    // -------------------------------
    const favorites = loadJSON("favorites.json");

    const entry = favorites.find((f) => f.email === userEmail);

    if (!entry) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          projectIds: [],
          message: "Nog geen favorieten gevonden."
        })
      };
    }


    // -------------------------------
    // SUCCES → FAVORIETEN TERUGSTUREN
    // -------------------------------
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        projectIds: entry.projectIds
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "favorites-load.js error"
      })
    };
  }
};
