// netlify/functions/admin-users-list.js

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
    // LOAD USERS
    // -------------------------------
    const users = await loadJSON("users.json");

    // Remove sensitive data before sending
    const sanitizedUsers = users.map(user => ({
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(sanitizedUsers)
    };

  } catch (err) {
    console.error("Error in admin-users-list:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Internal server error", details: err.message }) 
    };
  }
};
