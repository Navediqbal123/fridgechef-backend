require("dotenv").config();

const express = require("express");
const cors = require("cors");

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

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`FridgeChef server running on port ${PORT}`);
});
