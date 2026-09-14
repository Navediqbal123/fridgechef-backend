const express = require("express");
const router = express.Router();

const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL ||
  "https://integrate.api.nvidia.com/v1";

const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL ||
  "openai/gpt-oss-20b";

router.post("/generate", async (req, res) => {
  const { ingredients, preferences } = req.body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least one ingredient."
    });
  }

  const prompt = `
You are FridgeChef AI, an expert cooking assistant.

Create practical recipes using the user's available ingredients.

Available ingredients:
${ingredients.join(", ")}

User preferences:
${JSON.stringify(preferences || {})}

Return ONLY valid JSON.
Do not use markdown or code fences.

Return this structure:
{
  "recipes": [
    {
      "name": "Recipe name",
      "description": "Short description",
      "difficulty": "Easy",
      "time_minutes": 20,
      "servings": 2,
      "ingredients": [
        {
          "name": "Ingredient",
          "quantity": "2"
        }
      ],
      "steps": [
        "Step 1",
        "Step 2"
      ],
      "tips": [
        "Useful cooking tip"
      ]
    }
  ]
}

Generate up to 5 recipes.
`;

  try {
    const response = await fetch(
      `${NVIDIA_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream"
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are FridgeChef AI. Return valid JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.2,
          stream: true
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      return res.status(response.status).json({
        success: false,
        message: `NVIDIA API error: ${response.status}`,
        response: errorText
      });
    }

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (!response.body) {
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true
        });

        res.write(chunk);
      }
    } finally {
      reader.releaseLock();
      res.end();
    }

  } catch (error) {
    console.error("❌ Recipe streaming error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message || "Recipe streaming failed"
      });
    }

    res.end();
  }
});

module.exports = router;
