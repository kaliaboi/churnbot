import { WebClient } from "@slack/web-api";
import { config } from "../config";

export class SlackNotifier {
  private client: WebClient;

  constructor() {
    this.client = new WebClient(config.slack.botToken);
  }

  async sendFeedbackSummary(summary: string) {
    try {
      await this.client.chat.postMessage({
        channel: config.slack.channelId,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "📊 Customer Feedback Summary 📊",
              emoji: true,
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: summary
                .replace(/•/g, "•")
                .replace(/\n/g, "\n")
                .split("\n")
                .map((line) => line.trim())
                .join("\n"),
            },
          },
        ],
      });
    } catch (error) {
      console.error("Slack notification failed:", error);
      throw error;
    }
  }
}
