// netlify/functions/favorites-save.js

import { loadJSON, saveJSON, extractAuthToken, verifyToken } from "./lib/helpers.js";

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

    const token = extractAuthToken(authHeader);

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "JWT verificatie mislukt." })
      };
    }

    const userEmail = decoded.email;

    // -------------------------------
    // REQUEST BODY PARSEN
    // -------------------------------
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Request body ontbreekt." })
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Ongeldige JSON in request body." })
      };
    }

    const { projectId } = body;

    if (!projectId || typeof projectId !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "projectId ontbreekt of is ongeldig." })
      };
    }

    // -------------------------------
    // FAVORIETEN JSON LADEN
    // -------------------------------
    const favorites = await loadJSON("favorites.json");

    // Zoek favorieten van deze user
    let entry = favorites.find((f) => f.email === userEmail);

    // Nog geen favorieten? Aanmaken
    if (!entry) {
      entry = {
        email: userEmail,
        projectIds: [],
        createdAt: new Date().toISOString()
      };
      favorites.push(entry);
    }

    // -------------------------------
    // Project toevoegen (zonder duplicaten)
    // -------------------------------
    if (!entry.projectIds.includes(projectId)) {
      entry.projectIds.push(projectId);
      entry.updatedAt = new Date().toISOString();
    }

    // -------------------------------
    // OPSLAAN
    // -------------------------------
    await saveJSON("favorites.json", favorites);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Project opgeslagen als favoriet.",
        projectIds: entry.projectIds
      })
    };

  } catch (err) {
    console.error("Error in favorites-save:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: err.message
      })
    };
  }
};
