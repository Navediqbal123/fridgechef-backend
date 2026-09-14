const express = require("express");
const multer = require("multer");

const router = express.Router();

const { uploadFridgeImage } = require("../services/supabase.service");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }

    cb(null, true);
  }
});

router.post("/fridge-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a fridge image."
      });
    }

    const userId = req.body.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user_id is required."
      });
    }

    const extension =
      req.file.originalname.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${Date.now()}.${extension}`;

    const result = await uploadFridgeImage(
      userId,
      fileName,
      req.file.buffer,
      req.file.mimetype
    );

    res.status(201).json({
      success: true,
      message: "Fridge image uploaded successfully.",
      path: result.path
    });
  } catch (error) {
    console.error("Fridge image upload error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Image upload failed."
    });
  }
});

module.exports = router;
