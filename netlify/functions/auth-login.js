import jwt from "jsonwebtoken";

export const handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email required" })
      };
    }

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Magic link
    const url = `https://costacapital.pro/?token=${token}`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        magicLink: url
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
