import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY
});

export default async (req, res) => {
  try {
    const body = JSON.parse(req.body);
    const { project, investors } = body;

    const prompt = `
You are an AI specialized in matching investors or brokers to real-estate projects.

PROJECT:
${JSON.stringify(project, null, 2)}

INVESTORS:
${JSON.stringify(investors, null, 2)}

Return a JSON array. For each match:
{
  "name": "",
  "matchScore": 0-100,
  "reason": "",
  "type": ""
}
`;

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }]
    });

    const text = completion.choices[0].message.content;
    const parsed = JSON.parse(text);

    res.status(200).json(parsed);

  } catch (err) {
    res.status(500).json({
      error: err.message,
      details: "DeepSeek AI match error"
    });
  }
};
