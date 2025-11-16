// netlify/functions/auth-login.js

exports.handler = async (event, context) => {
  try {
    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is required" })
      };
    }

    // ADMIN
    const ADMIN_EMAIL = "jaap@jlmbusinessholding.com";

    const user = {
      email,
      role: email === ADMIN_EMAIL ? "admin" : "investor"
    };

    // Fake JWT for now
    const fakeToken = Buffer.from(
      JSON.stringify({ email: user.email, role: user.role })
    ).toString("base64");

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user,
        token: fakeToken
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
