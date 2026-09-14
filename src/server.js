require("dotenv").config();

const express = require("express");
const cors = require("cors");

const recipeRoutes = require("./routes/recipe.routes");
const fridgeRoutes = require("./routes/fridge.routes");
const uploadRoutes = require("./routes/upload.routes");
const nvidiaTestRoutes = require("./routes/nvidia-test.routes");
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FridgeChef Backend is running 🚀"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "FridgeChef API",
    status: "healthy"
  });
});

app.use("/api/recipes", recipeRoutes);
app.use("/api/fridge", fridgeRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/nvidia-test", nvidiaTestRoutes);

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`FridgeChef server running on port ${PORT}`);
});
