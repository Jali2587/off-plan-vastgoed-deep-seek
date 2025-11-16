// netlify/functions/admin-investor-stats.js

import jwt from "jsonwebtoken";
import { loadJSON } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    const auth = event.headers.authorization;
    if (!auth) return { statusCode: 401, body: "Missing authorization" };

    const token = auth.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return { statusCode: 403, body: "Forbidden: admin only" };
    }

    const profiles = loadJSON("profiles.json");

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
    return { statusCode: 500, body: err.message };
  }
};
