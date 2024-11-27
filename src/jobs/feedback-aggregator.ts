import { pool } from "../db";
import { summarizeFeedback } from "../services/feedback-summarizer";
import { SlackNotifier } from "../services/slack-notifier";

export async function aggregateFeedback() {
  const client = await pool.connect();
  try {
    // Fetch unprocessed feedback from last 24 hours
    const query = `
      SELECT payload 
      FROM webhook_events 
      WHERE 
        created_at > NOW() - INTERVAL '24 hours' 
        AND payload->>'event' = 'session'
        AND (payload->'data'->>'feedback' IS NOT NULL 
             OR payload->'data'->>'surveyResponse' IS NOT NULL)
      LIMIT 50
    `;

    const result = await client.query(query);

    // Extract feedback texts
    const feedbackTexts = result.rows
      .map(
        (row) =>
          row.payload.data.session?.feedback ||
          row.payload.data.session?.surveyResponse
      )
      .filter(Boolean);

    if (feedbackTexts.length > 0) {
      const summary = await summarizeFeedback(feedbackTexts);

      const slackNotifier = new SlackNotifier();
      await slackNotifier.sendFeedbackSummary(summary);
    }
  } catch (error) {
    console.error("Feedback aggregation failed:", error);
  } finally {
    client.release();
  }
}
