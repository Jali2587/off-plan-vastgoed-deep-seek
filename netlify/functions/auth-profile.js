// netlify/functions/auth-profile.js
const { blobs } = require("@netlify/blobs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.handler = async (event, context) => {
  try {
    const store = blobs();

    if (event.httpMethod === "POST") {
      const { token, profile } = JSON.parse(event.body || "{}");

      if (!token || !profile) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing token or profile" })
        };
      }

      const user = jwt.verify(token, JWT_SECRET);

      await store.setJSON(`profiles/${user.email}`, profile);

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    if (event.httpMethod === "GET") {
      const token = event.queryStringParameters?.token;
      if (!token) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing token" })
        };
      }

      const user = jwt.verify(token, JWT_SECRET);

      const profile = await store.get(`profiles/${user.email}`, {
        type: "json"
      });

      return {
        statusCode: 200,
        body: JSON.stringify(profile || {})
      };
    }

    return { statusCode: 405 };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
