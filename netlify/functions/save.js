import fs from "fs";
import path from "path";

export default async (req, res) => {
  try {
    const { newData, file } = JSON.parse(req.body);

    const fullPath = path.join(process.cwd(), "data", file);

    let existing = [];

    if (fs.existsSync(fullPath)) {
      const fileData = fs.readFileSync(fullPath, "utf8");
      existing = JSON.parse(fileData);
    }

    existing.push(newData);

    fs.writeFileSync(fullPath, JSON.stringify(existing, null, 2));

    res.status(200).json({ success: true, saved: newData });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
