// netlify/functions/admin-reservations-list.js

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
    // LOAD RESERVATIONS
    // -------------------------------
    const reservations = await loadJSON("reservations.json");

    return {
      statusCode: 200,
      body: JSON.stringify(reservations)
    };
    
  } catch (err) {
    console.error("Error in admin-reservations-list:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Internal server error", details: err.message }) 
    };
  }
};
