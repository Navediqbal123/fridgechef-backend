const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";

const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL || "moonshotai/kimi-k3";

async function generateRecipe(ingredients, preferences = {}) {
  if (!process.env.NVIDIA_API_KEY) {
    throw new Error("NVIDIA_API_KEY is not configured");
  }

  const prompt = `
You are FridgeChef AI, an expert cooking assistant.

Create practical recipes using the user's available ingredients.

Available ingredients:
${ingredients.join(", ")}

User preferences:
${JSON.stringify(preferences)}

Return JSON only in this format:
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
      "tips": ["Useful cooking tip"]
    }
  ]
}

Suggest up to 5 recipes.
Prioritize recipes that use the available ingredients and reduce food waste.
`;

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
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
          content: "You are FridgeChef AI. Return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4096,
      temperature: 0.7,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No recipe response received from NVIDIA");
  }

  try {
    return JSON.parse(content);
  } catch {
    return {
      recipes: [],
      raw_response: content
    };
  }
}

module.exports = {
  generateRecipe
};
