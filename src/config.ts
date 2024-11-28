import dotenv from "dotenv";
dotenv.config();

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },
  database: {
    connectionString: process.env.POSTGRES_URL!,
  },
  churnkey: {
    webhookSecret: process.env.CHURNKEY_WEBHOOK_SECRET!,
  },
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN!,
    channelId: process.env.SLACK_FEEDBACK_CHANNEL_ID!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY!,
  },
};
