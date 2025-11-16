// netlify/functions/auth-login.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const ADMIN_EMAIL = "jaap@jlmbusinessholding.com";

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Only POST allowed" })
      };
    }

    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing email" })
      };
    }

    // GENEREER MAGIC LINK TOKEN
    const token = jwt.sign(
      {
        email,
        role: email === ADMIN_EMAIL ? "admin" : "investor"
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const magicLink = `https://${event.headers.host}/?token=${token}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        magicLink
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
