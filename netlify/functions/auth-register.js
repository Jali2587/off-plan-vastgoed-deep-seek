import fs from "fs";
import path from "path";

export const handler = async (event) => {
  try {
    const { email, role } = JSON.parse(event.body || "{}");

    if (!email || !role) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and role required" })
      };
    }

    const filePath = path.join(process.cwd(), "data", "users.json");
    let users = [];

    if (fs.existsSync(filePath)) {
      users = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    const exists = users.find((u) => u.email === email);
    if (exists) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, user: exists })
      };
    }

    const newUser = {
      email,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, user: newUser })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
