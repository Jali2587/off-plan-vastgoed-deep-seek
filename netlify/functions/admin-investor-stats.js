// netlify/functions/admin-investor-stats.js

import { loadJSON, extractAuthToken, verifyToken } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    // -------------------------------
    // AUTH CHECK
    // -------------------------------
    const auth = event.headers.authorization;
    
    if (!auth) {
      return { 
        statusCode: 401, 
        body: JSON.stringify({ error: "Missing authorization" }) 
      };
    }

    const token = extractAuthToken(auth);
    
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return { 
        statusCode: 401, 
        body: JSON.stringify({ error: "Invalid token" }) 
      };
    }

    if (decoded.role !== "admin") {
      return { 
        statusCode: 403, 
        body: JSON.stringify({ error: "Forbidden: admin only" }) 
      };
    }

    // -------------------------------
    // LOAD PROFILES
    // -------------------------------
    const profiles = await loadJSON("profiles.json");

    if (!profiles || profiles.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          totalInvestors: 0,
          avgTicketMin: 0,
          avgTicketMax: 0,
          favoriteRegions: {}
        })
      };
    }

    // -------------------------------
    // CALCULATE STATS
    // -------------------------------
    const summary = {
      totalInvestors: profiles.length,
      avgTicketMin: Math.round(
        profiles.reduce((s, p) => s + (p.ticketMin || 0), 0) / profiles.length
      ),
      avgTicketMax: Math.round(
        profiles.reduce((s, p) => s + (p.ticketMax || 0), 0) / profiles.length
      ),
      favoriteRegions: {}
    };

    profiles.forEach((p) => {
      (p.regions || []).forEach((r) => {
        summary.favoriteRegions[r] = (summary.favoriteRegions[r] || 0) + 1;
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify(summary)
    };

  } catch (err) {
    console.error("Error in admin-investor-stats:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Internal server error", details: err.message }) 
    };
  }
};
