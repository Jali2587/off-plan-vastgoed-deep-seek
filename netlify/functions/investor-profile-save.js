// netlify/functions/investor-profile-save.js

import { loadJSON, saveJSON, extractAuthToken, verifyToken } from "./lib/helpers.js";

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
    // BODY PARSEN
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

    const {
      strategy,
      ticketMin,
      ticketMax,
      regions,
      roiTarget,
      riskProfile,
      notes
    } = body;

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

    // Validate numeric fields
    if (ticketMin !== undefined && (typeof ticketMin !== "number" || ticketMin < 0)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "ticketMin moet een positief getal zijn." })
      };
    }

    if (ticketMax !== undefined && (typeof ticketMax !== "number" || ticketMax < 0)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "ticketMax moet een positief getal zijn." })
      };
    }

    if (ticketMin !== undefined && ticketMax !== undefined && ticketMin > ticketMax) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "ticketMin kan niet groter zijn dan ticketMax." })
      };
    }

    // -------------------------------
    // PROFIEL JSON LADEN
    // -------------------------------
    const profiles = await loadJSON("profiles.json");

    // Bestaat profiel al?
    let existing = profiles.find((p) => p.email === userEmail);

    if (!existing) {
      existing = { 
        email: userEmail,
        createdAt: new Date().toISOString()
      };
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
    await saveJSON("profiles.json", profiles);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Investeerdersprofiel opgeslagen.",
        profile: existing
      })
    };

  } catch (err) {
    console.error("Error in investor-profile-save:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        details: err.message
      })
    };
  }
};
