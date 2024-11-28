import { supabase } from "../db";
import { summarizeFeedback } from "../services/feedback-summarizer";
import { SlackNotifier } from "../services/slack-notifier";

export async function aggregateFeedback() {
  try {
    const { data: events, error } = await supabase
      .from("webhook_events")
      .select("payload")
      .gte(
        "created_at",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .eq("payload->event", "session")
      .or(
        "payload->data->feedback.neq.null,payload->data->surveyResponse.neq.null"
      )
      .limit(50);

    if (error) throw error;

    // Extract feedback texts
    const feedbackTexts = events
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
  }
}
