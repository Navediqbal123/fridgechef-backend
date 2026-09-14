const express = require("express");
const router = express.Router();

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL = "openai/gpt-oss-20b";

router.get("/test", async (req, res) => {
  console.log("🧪 NVIDIA TEST STARTED");
  console.log("Model:", NVIDIA_MODEL);
  console.log("Base URL:", NVIDIA_BASE_URL);

  if (!process.env.NVIDIA_API_KEY) {
    return res.status(500).json({
      success: false,
      message: "NVIDIA_API_KEY is not configured"
    });
  }

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
              role: "user",
              content: "Reply with only: NVIDIA TEST SUCCESS"
            }
          ],
          max_tokens: 20,
          temperature: 0,
          stream: false
        }),
        signal: controller.signal
      }
    );

    console.log("📡 NVIDIA TEST STATUS:", response.status);

    const text = await response.text();

    console.log("📨 NVIDIA TEST RESPONSE:", text);

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        status: response.status,
        message: "NVIDIA API returned an error",
        response: text
      });
    }

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({
        success: false,
        message: "NVIDIA returned invalid JSON",
        response: text
      });
    }

    return res.json({
      success: true,
      message: "NVIDIA connection working",
      model: NVIDIA_MODEL,
      response:
        data?.choices?.[0]?.message?.content || null
    });

  } catch (error) {
    console.error("❌ NVIDIA TEST ERROR:", error);

    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message: "NVIDIA API timed out after 60 seconds"
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "NVIDIA connection failed"
    });

  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
