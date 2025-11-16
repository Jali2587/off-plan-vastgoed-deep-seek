// netlify/functions/admin-profile-list.js

import jwt from "jsonwebtoken";
import { loadJSON } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    // AUTH CHECK
    const auth = event.headers.authorization;
    if (!auth) return { statusCode: 401, body: "Missing authorization" };

    const token = auth.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return { statusCode: 403, body: "Forbidden: admin only" };
    }

    const profiles = loadJSON("profiles.json");

    return {
      statusCode: 200,
      body: JSON.stringify(profiles)
    };

  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
