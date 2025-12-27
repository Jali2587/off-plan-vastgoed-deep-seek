// netlify/functions/admin-delete-project.js

import { loadJSON, saveJSON, extractAuthToken, verifyToken } from "./lib/helpers.js";

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
    // PARSE REQUEST BODY
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

    const { projectId } = body;

    if (!projectId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "projectId ontbreekt." })
      };
    }

    // -------------------------------
    // DELETE PROJECT
    // -------------------------------
    let projects = await loadJSON("projects.json");
    const initialLength = projects.length;
    
    projects = projects.filter((p) => p.id !== projectId);

    if (projects.length === initialLength) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Project niet gevonden." })
      };
    }

    await saveJSON("projects.json", projects);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Project verwijderd.",
        projectId
      })
    };

  } catch (err) {
    console.error("Error in admin-delete-project:", err);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Internal server error", details: err.message }) 
    };
  }
};
