// netlify/functions/admin-project-stats.js

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

    const projects = loadJSON("projects.json");

    const stats = projects.map((p) => ({
      id: p.id,
      title: p.title,
      available: p.totalUnits - p.soldUnits,
      soldPercentage: Math.round((p.soldUnits / p.totalUnits) * 100),
      roi: p.roi,
      m2: p.m2,
      region: p.location.split(",")[1]?.trim() || "Onbekend"
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(stats)
    };

  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
