// netlify/functions/investor-profile-save.js

import jwt from "jsonwebtoken";
import { loadJSON, saveJSON } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    // -------------------------------
    // AUTHENTICATIE CHECK
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
    // BODY PARSEN
    // -------------------------------
    const {
      strategy,
      ticketMin,
      ticketMax,
      regions,
      roiTarget,
      riskProfile,
      notes
    } = JSON.parse(event.body);

    // -------------------------------
    // VALIDATIE
    // -------------------------------
    if (!strategy && !ticketMin && !ticketMax && !regions && !roiTarget) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Geen profieldata ontvangen."
        })
      };
    }

    // -------------------------------
    // PROFIEL JSON LADEN
    // -------------------------------
    const profiles = loadJSON("profiles.json");

    // Bestaat profiel al?
    let existing = profiles.find((p) => p.email === userEmail);

    if (!existing) {
      existing = { email: userEmail };
      profiles.push(existing);
    }

    // -------------------------------
    // PROFIEL UPDATEN
    // -------------------------------
    existing.updatedAt = new Date().toISOString();
    existing.strategy = strategy || existing.strategy;
    existing.ticketMin = ticketMin ?? existing.ticketMin;
    existing.ticketMax = ticketMax ?? existing.ticketMax;
    existing.regions = regions || existing.regions;
    existing.roiTarget = roiTarget ?? existing.roiTarget;
    existing.riskProfile = riskProfile || existing.riskProfile;
    existing.notes = notes || existing.notes;

    // -------------------------------
    // OPSLAAN
    // -------------------------------
    saveJSON("profiles.json", profiles);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Investeerdersprofiel opgeslagen.",
        profile: existing
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "investor-profile-save.js error"
      })
    };
  }
};
