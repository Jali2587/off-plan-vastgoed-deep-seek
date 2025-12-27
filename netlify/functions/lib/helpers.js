// netlify/functions/lib/helpers.js
import { blobs } from "@netlify/blobs";
import jwt from "jsonwebtoken";

// ---------------------------
// READ JSON FROM NETLIFY BLOBS
// ---------------------------
export async function loadJSON(filename) {
  try {
    const store = blobs();
    const blobKey = `data/${filename}`;
    
    const data = await store.get(blobKey, { type: "json" });
    
    // If blob doesn't exist, return empty array
    if (!data) {
      return [];
    }
    
    // Ensure we always return an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error loading ${filename} from Netlify Blobs:`, error);
    return [];
  }
}

// ---------------------------
// WRITE JSON TO NETLIFY BLOBS
// ---------------------------
export async function saveJSON(filename, data) {
  try {
    const store = blobs();
    const blobKey = `data/${filename}`;
    
    await store.set(blobKey, JSON.stringify(data, null, 2), {
      metadata: {
        contentType: "application/json",
        lastModified: new Date().toISOString()
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Error saving ${filename} to Netlify Blobs:`, error);
    throw error;
  }
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

// ---------------------------
// VERIFY JWT TOKEN
// ---------------------------
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error("JWT verification failed");
  }
}

// ---------------------------
// VALIDATE EMAIL
// ---------------------------
export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

// ---------------------------
// EXTRACT AUTH TOKEN FROM HEADER
// ---------------------------
export function extractAuthToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Invalid authorization header");
  }
  
  return authHeader.replace("Bearer ", "").trim();
}

