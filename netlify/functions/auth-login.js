// netlify/functions/auth-login.js

import { loadJSON, createToken } from "./lib/helpers.js";

export const handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is verplicht." })
      };
    }

    const users = loadJSON("users.json");

    const user = users.find((u) => u.email === email);

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Account niet gevonden." })
      };
    }

    // Alles goed → token genereren
    return {
      statusCode: 200,
      body: JSON.stringify({
        user,
        token: createToken(user)
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "auth-login error"
      })
    };
  }
};
