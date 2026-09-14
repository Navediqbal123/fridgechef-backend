const express = require("express");
const router = express.Router();

const { generateRecipe } = require("../services/nvidia.service");

router.post("/generate", async (req, res) => {
  console.log("➡️ Recipe API request received");

  try {
    const { ingredients, preferences } = req.body;

    console.log("🥕 Ingredients:", ingredients);

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient."
      });
    }

    console.log("🤖 Calling NVIDIA service...");

    const timeout = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("NVIDIA API request timed out after 30 seconds.")),
        30000
      )
    );

    const result = await Promise.race([
      generateRecipe(ingredients, preferences || {}),
      timeout
    ]);

    console.log("✅ NVIDIA response received");

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("❌ Recipe generation error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate recipes."
    });
  }
});

module.exports = router;
