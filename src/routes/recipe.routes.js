const express = require("express");
const router = express.Router();

// Generate recipe from ingredients
router.post("/generate", async (req, res) => {
  try {
    const { ingredients, preferences } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one ingredient."
      });
    }

    // NVIDIA AI integration will be connected here
    // in the next step.

    res.json({
      success: true,
      message: "Recipe request received.",
      ingredients,
      preferences: preferences || {},
      recipes: []
    });
  } catch (error) {
    console.error("Recipe generation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate recipes."
    });
  }
});

module.exports = router;
