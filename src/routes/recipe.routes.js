const express = require("express");
const router = express.Router();

const { generateRecipe } = require("../services/nvidia.service");

router.post("/generate", async (req, res) => {
  console.log("➡️ Recipe API request received");

  try {
    const { ingredients, preferences } = req.body;

    console.log("🥕 Ingredients:", ingredients);
    console.log("🤖 Calling NVIDIA service...");

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient."
      });
    }

    const result = await generateRecipe(
      ingredients,
      preferences || {}
    );

    console.log("✅ Recipe generated successfully");

    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("❌ Recipe generation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate recipes."
    });
  }
});

module.exports = router;
