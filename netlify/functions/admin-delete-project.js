// netlify/functions/admin-delete-project.js

import jwt from "jsonwebtoken";
import { loadJSON, saveJSON } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    const auth = event.headers.authorization;
    if (!auth) return { statusCode: 401, body: "Missing authorization" };

    const token = auth.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return { statusCode: 403, body: "Forbidden: admin only" };
    }

    const { projectId } = JSON.parse(event.body);

    let projects = loadJSON("projects.json");
    projects = projects.filter((p) => p.id !== projectId);

    saveJSON("projects.json", projects);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Project verwijderd.",
        projectId
      })
    };

  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
