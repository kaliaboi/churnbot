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
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .eq("event_type", "session")
      .not("payload->data->session->feedback", "is", null)
      .limit(100);

    if (error) throw error;

    // Extract feedback texts
    const feedbackTexts = events
      ?.map((row) => row.payload.data.session?.feedback)
      .filter(Boolean);

    if (feedbackTexts && feedbackTexts.length > 0) {
      const summary = await summarizeFeedback(feedbackTexts);
      console.log("Summary:", summary);
      const slackNotifier = new SlackNotifier();
      await slackNotifier.sendFeedbackSummary(summary);
    } else {
      console.log("No feedback found for the period");
    }
  } catch (error) {
    console.error("Feedback aggregation failed:", error);
  }
}
