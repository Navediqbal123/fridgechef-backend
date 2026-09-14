const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";

const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL || "openai/gpt-oss-20b";

async function generateRecipe(ingredients, preferences = {}) {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    throw new Error("At least one ingredient is required");
  }

  const prompt = `
You are FridgeChef AI, an expert cooking assistant.

Create practical recipes using the user's available ingredients.

Available ingredients:
${ingredients.join(", ")}

User preferences:
${JSON.stringify(preferences)}

IMPORTANT:
- Use the available ingredients as much as possible.
- Reduce food waste.
- You may include common pantry ingredients when necessary.
- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT use code fences.
- Do NOT add any text before or after the JSON.

Return exactly this structure:

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

  console.log("🤖 NVIDIA request started");
  console.log("Model:", NVIDIA_MODEL);
  console.log("Ingredients:", ingredients);

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 60000);

  try {
    const response = await fetch(
      `${NVIDIA_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are FridgeChef AI. Return ONLY valid JSON. No markdown. No code fences."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.2,
          stream: false
        }),
        signal: controller.signal
      }
    );

    console.log("📡 NVIDIA status:", response.status);

    const responseText = await response.text();

    if (!response.ok) {
      console.error("❌ NVIDIA API response:", responseText);

      throw new Error(
        `NVIDIA API error: ${response.status} ${responseText}`
      );
    }

    if (!responseText) {
      throw new Error("NVIDIA returned an empty response");
    }

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("❌ Invalid NVIDIA JSON response:", responseText);
      throw new Error("Invalid response received from NVIDIA");
    }

    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("❌ NVIDIA response missing content:", data);
      throw new Error("No recipe response received from NVIDIA");
    }

    console.log("✅ NVIDIA response received");

    let cleanedContent = String(content).trim();

    // Remove markdown code fences if the model adds them
    cleanedContent = cleanedContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // Find the JSON object if extra text was returned
    const firstBrace = cleanedContent.indexOf("{");
    const lastBrace = cleanedContent.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanedContent = cleanedContent.slice(
        firstBrace,
        lastBrace + 1
      );
    }

    let recipeData;

    try {
      recipeData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error(
        "❌ Could not parse recipe JSON:",
        cleanedContent
      );

      throw new Error(
        "NVIDIA returned an invalid recipe format"
      );
    }

    // Make sure recipes is always an array
    if (!Array.isArray(recipeData.recipes)) {
      recipeData.recipes = [];
    }

    return {
      recipes: recipeData.recipes
    };

  } catch (error) {
    if (error.name === "AbortError") {
      console.error(
        "⏱️ NVIDIA request timed out after 60 seconds"
      );

      throw new Error(
        "NVIDIA API request timed out after 60 seconds"
      );
    }

    console.error("❌ NVIDIA service error:", error);
    throw error;

  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  generateRecipe
};
