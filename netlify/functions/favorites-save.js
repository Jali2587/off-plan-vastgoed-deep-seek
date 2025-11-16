// netlify/functions/favorites-save.js

import jwt from "jsonwebtoken";
import { loadJSON, saveJSON } from "./lib/helpers.js";

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
    // REQUEST BODY PARSEN
    // -------------------------------
    const { projectId } = JSON.parse(event.body);

    if (!projectId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "projectId ontbreekt." })
      };
    }

    // -------------------------------
    // FAVORIETEN JSON LADEN
    // -------------------------------
    const favorites = loadJSON("favorites.json");

    // Zoek favorieten van deze user
    let entry = favorites.find((f) => f.email === userEmail);

    // Nog geen favorieten? Aanmaken
    if (!entry) {
      entry = {
        email: userEmail,
        projectIds: []
      };
      favorites.push(entry);
    }

    // -------------------------------
    // Project toevoegen (zonder duplicaten)
    // -------------------------------
    if (!entry.projectIds.includes(projectId)) {
      entry.projectIds.push(projectId);
    }

    // -------------------------------
    // OPSLAAN
    // -------------------------------
    saveJSON("favorites.json", favorites);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Project opgeslagen als favoriet.",
        projectIds: entry.projectIds
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "favorites-save.js error"
      })
    };
  }
};
