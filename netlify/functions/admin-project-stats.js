// netlify/functions/admin-project-stats.js

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
    // LOAD PROJECTS
    // -------------------------------
    const projects = await loadJSON("projects.json");

    if (!projects || projects.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify([])
      };
    }

    // -------------------------------
    // CALCULATE STATS
    // -------------------------------
    const stats = projects.map((p) => ({
      id: p.id,
      title: p.title,
      available: (p.totalUnits || 0) - (p.soldUnits || 0),
      soldPercentage: p.totalUnits > 0 
        ? Math.round((p.soldUnits / p.totalUnits) * 100)
        : 0,
      roi: p.roi,
      m2: p.m2,
      region: p.location?.split(",")[1]?.trim() || "Onbekend"
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(stats)
    };

  } catch (err) {
    console.error("Error in admin-project-stats:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Internal server error", details: err.message }) 
    };
  }
};
