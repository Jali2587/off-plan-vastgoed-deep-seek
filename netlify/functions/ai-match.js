// netlify/functions/ai-match.js

import fetch from "node-fetch"; // belangrijk voor Netlify

export const handler = async (event) => {
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Missing DeepSeek API key",
          env: "DEEPSEEK_API_KEY not set"
        })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { project, investors } = body;

    if (!project || !investors) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing project or investor data"
        })
      };
    }

    // Construct prompt
    const prompt = `
You are an AI specialized in matching investors to real-estate projects.

PROJECT:
${JSON.stringify(project, null, 2)}

INVESTORS:
${JSON.stringify(investors, null, 2)}

Return ONLY a JSON array (no text before or after).
Each item must follow:
{
  "name": "",
  "matchScore": 0-100,
  "reason": "",
  "type": ""
}
`;

    // DeepSeek API call
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "DeepSeek API error",
          details: errorText
        })
      };
    }

    const data = await response.json();

    const answer = data?.choices?.[0]?.message?.content || "";

    // Extract JSON array safely
    const jsonStart = answer.indexOf("[");
    const jsonEnd = answer.lastIndexOf("]") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "AI response did not contain valid JSON",
          raw: answer
        })
      };
    }

    const cleanJson = answer.substring(jsonStart, jsonEnd);
    const parsed = JSON.parse(cleanJson);

    return {
      statusCode: 200,
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "DeepSeek AI match function crashed"
      })
    };
  }
};
