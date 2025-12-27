// netlify/functions/investor-profile-load.js

import { loadJSON, extractAuthToken, verifyToken } from "./lib/helpers.js";

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

    const token = extractAuthToken(authHeader);

    // -------------------------------
    // JWT VERIFIËREN
    // -------------------------------
    let decoded;
    try {
      decoded = verifyToken(token);
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
    const profiles = await loadJSON("profiles.json");

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
    console.error("Error in investor-profile-load:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: err.message
      })
    };
  }
};
