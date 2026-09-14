const express = require("express");
const router = express.Router();

const { generateRecipe } = require("../services/nvidia.service");

// Get recipes from manually entered fridge ingredients
router.post("/recipes", async (req, res) => {
  try {
    const { ingredients, preferences } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide fridge ingredients."
      });
    }

    const result = await generateRecipe(
      ingredients,
      preferences || {}
    );

    res.json({
      success: true,
      source: "fridge",
      ...result
    });
  } catch (error) {
    console.error("Fridge recipe error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate recipes."
    });
  }
});

module.exports = router;
