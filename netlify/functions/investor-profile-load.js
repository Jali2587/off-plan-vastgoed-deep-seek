// netlify/functions/investor-profile-load.js

import jwt from "jsonwebtoken";
import { loadJSON } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    // -------------------------------
    // AUTH HEADER CONTROLEREN
    // -------------------------------
    const authHeader = event.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: "Geen geldige autorisatie header."
        })
      };
    }

    const token = authHeader.replace("Bearer ", "").trim();

    // -------------------------------
    // JWT VERIFIËREN
    // -------------------------------
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: "JWT verificatie mislukt.",
          details: err.message
        })
      };
    }

    const userEmail = decoded.email;

    // -------------------------------
    // PROFIELS LADEN
    // -------------------------------
    const profiles = loadJSON("profiles.json");

    const profile = profiles.find((p) => p.email === userEmail);

    // Geen profiel gevonden → lege terugsturen
    if (!profile) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          exists: false,
          profile: null,
          message: "Geen profiel gevonden voor deze gebruiker."
        })
      };
    }

    // -------------------------------
    // SUCCES → PROFIEL TERUGSTUREN
    // -------------------------------
    return {
      statusCode: 200,
      body: JSON.stringify({
        exists: true,
        profile
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "investor-profile-load.js error"
      })
    };
  }
};
