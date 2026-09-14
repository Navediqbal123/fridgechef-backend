const express = require("express");
const router = express.Router();

const { generateRecipe } = require("../services/nvidia.service");

router.post("/generate", async (req, res) => {
  try {
    const { ingredients, preferences } = req.body;

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

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error("Recipe generation error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate recipes."
    });
  }
});

module.exports = router;
