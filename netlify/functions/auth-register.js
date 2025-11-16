// netlify/functions/auth-register.js

import { loadJSON, saveJSON, createToken } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    const { email, role } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is verplicht." })
      };
    }

    const users = loadJSON("users.json");

    // Bestaat al?
    const existing = users.find((u) => u.email === email);
    if (existing) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          user: existing,
          token: createToken(existing)
        })
      };
    }

    // Nieuw account
    const newUser = {
      id: Date.now(),
      email,
      role: role || "investor", // default investor
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveJSON("users.json", users);

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: newUser,
        token: createToken(newUser)
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "auth-register error"
      })
    };
  }
};
