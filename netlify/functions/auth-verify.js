// netlify/functions/auth-verify.js

exports.handler = async (event, context) => {
  try {
    const { token } = JSON.parse(event.body || "{}");

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing token", success: false })
      };
    }

    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf8"));

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user: decoded
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message
      })
    };
  }
};
