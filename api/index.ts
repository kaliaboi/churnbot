import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import { aggregateFeedback } from "../src/jobs/feedback-aggregator";
import { verifyWebhookSignature } from "../src/services/webhook-verifier";
import { saveWebhookEvent } from "../src/db";
import { summarizeFeedback } from "../src/services/feedback-summarizer";
import { supabase } from "../src/db";

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

// Temporary endpoint to trigger feedback summarization, can use this to manually run the summarization job
app.get("/api/summarize-feedback", async (req, res) => {
  // Verify the cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("Unauthorized cron job attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }

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

// New endpoint for summary preview
app.get("/api/preview-summary", async (req, res) => {
  // Verify the cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("Unauthorized summary preview attempt");
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("Summary preview triggered:", new Date().toISOString());
  try {
    const { data: events, error } = await supabase
      .from("webhook_events")
      .select("payload")
      .gte(
        "created_at",
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .eq("event_type", "session")
      .not("payload->data->session->feedback", "is", null)
      .limit(100);

    if (error) throw error;

    const feedbackTexts = events
      ?.map((row) => row.payload.data.session?.feedback)
      .filter(Boolean);

    if (feedbackTexts && feedbackTexts.length > 0) {
      const summary = await summarizeFeedback(feedbackTexts);
      console.log("Summary preview generated successfully");
      res.status(200).json({
        message: "Summary generated successfully",
        summary,
        feedbackCount: feedbackTexts.length,
      });
    } else {
      console.log("No feedback found for the period");
      res.status(200).json({
        message: "No feedback found for the period",
        feedbackCount: 0,
      });
    }
  } catch (error) {
    console.error("Summary preview failed:", error);
    res.status(500).json({
      error: "Summary generation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
