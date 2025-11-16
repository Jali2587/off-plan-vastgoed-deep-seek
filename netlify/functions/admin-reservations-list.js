// netlify/functions/admin-reservations-list.js

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

    const reservations = loadJSON("reservations.json");

    return {
      statusCode: 200,
      body: JSON.stringify(reservations)
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
