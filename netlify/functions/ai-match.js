// netlify/functions/ai-match.js

exports.handler = async (event, context) => {
  try {
    const { project, investors } = JSON.parse(event.body);

    const prompt = `
You are an AI specialized in matching investors to real-estate projects.

PROJECT:
${JSON.stringify(project, null, 2)}

INVESTORS:
${JSON.stringify(investors, null, 2)}

Return ONLY a JSON array, no explanations.
Each item:
{
  "name": "",
  "matchScore": 0-100,
  "reason": "",
  "type": ""
}
`;

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

    const data = await response.json();
    const text = data.choices[0].message.content;

    // Safety parsing: extract only JSON
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]") + 1;
    const jsonString = text.substring(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonString);

    return {
      statusCode: 200,
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        details: "DeepSeek AI match function error"
      })
    };
  }
};
