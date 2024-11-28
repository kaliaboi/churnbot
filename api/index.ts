import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import { aggregateFeedback } from "../src/jobs/feedback-aggregator";
import { verifyWebhookSignature } from "../src/services/webhook-verifier";
import { saveWebhookEvent } from "../src/db";

const app = express();
const PORT = process.env.PORT || 3001;

// Raw body parser for signature verification
app.use(
  bodyParser.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// Churnkey webhook endpoint
app.post("/api/webhooks/churnkey", async (req, res) => {
  try {
    // Extract signature from headers
    const signature = req.get("ck-signature");
    if (!signature) {
      return res.status(401).json({ message: "No signature provided" });
    }

    // Verify webhook signature
    const payload = req.body;
    if (!verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({ message: "Invalid webhook signature" });
    }

    // Save webhook event
    await saveWebhookEvent({
      id: uuidv4(),
      ...payload,
    });

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      message: "Error processing webhook",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Temporary endpoint to trigger feedback summarization
app.get("/api/summarize-feedback", async (req, res) => {
  console.log("Feedback summarization triggered:", new Date().toISOString());
  try {
    await aggregateFeedback();
    console.log("Feedback summarization completed successfully");
    res.status(200).json({ message: "Feedback summarization completed" });
  } catch (error) {
    console.error("Feedback summarization failed:", error);
    res.status(500).json({ error: "Summarization failed" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
