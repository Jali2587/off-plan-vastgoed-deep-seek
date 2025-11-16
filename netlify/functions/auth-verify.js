// netlify/functions/auth-verify.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

exports.handler = async (event, context) => {
  try {
    const { token } = JSON.parse(event.body || "{}");

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing token" })
      };
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user: {
          email: decoded.email,
          role: decoded.role
        }
      })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        error: "Token invalid or expired"
      })
    };
  }
};
