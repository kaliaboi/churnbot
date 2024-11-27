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
        text: "📊 *Customer Feedback Summary* 📊",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: summary,
            },
          },
        ],
      });
    } catch (error) {
      console.error("Slack notification failed:", error);
    }
  }
}
