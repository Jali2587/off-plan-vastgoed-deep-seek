// netlify/functions/auth-verify.js
import { blobs } from "@netlify/blobs";

export const handler = async (event) => {
  try {
    const { token } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Token ontbreekt" })
      };
    }

    // In deze eenvoudige setup vertrouwen we de token (geen JWT check)
    // We laden enkel de user info om terug te geven.

    const store = blobs();
    const blobKey = "data/users.json";
    let users = await store.get(blobKey, { type: "json" });
    if (!users) users = [];

    // Normaal zou je token->user mapping opslaan, maar voor nu:
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user: null, // Frontend bevat user-object al in localStorage
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "auth-verify error"
      })
    };
  }
};
