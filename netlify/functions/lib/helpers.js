// netlify/functions/lib/helpers.js
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const DATA_DIR = path.join(process.cwd(), "data");

// ---------------------------
// READ JSON DATASTORE
// ---------------------------
export function loadJSON(filename) {
  const file = path.join(DATA_DIR, filename);
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// ---------------------------
// WRITE JSON DATASTORE
// ---------------------------
export function saveJSON(filename, data) {
  const file = path.join(DATA_DIR, filename);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ---------------------------
// JWT HELPERS
// ---------------------------
export function createToken(user) {
  return jwt.sign(
    {
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

