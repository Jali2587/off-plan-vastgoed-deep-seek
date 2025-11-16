import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

export const handler = async (event) => {
  try {
    const { token } = JSON.parse(event.body || "{}");

    if (!token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Token required" })
      };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const filePath = path.join(process.cwd(), "data", "users.json");
    const users = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const user = users.find((u) => u.email === decoded.email);

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, user })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
