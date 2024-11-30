import OpenAI from "openai";
import { config } from "../config";

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function summarizeFeedback(
  feedbackItems: string[]
): Promise<string> {
  const prompt = `Analyze the following customer feedback items and provide a concise summary:

${feedbackItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Format your response exactly like this example, using Slack markdown:

*📈 Key Themes*
1. Theme point 1
2. Theme point 2

*❗ Pain Points*
1. Pain point 1
2. Pain point 2

*💡 Actionable Insights*
1. Action item 1
2. Action item 2

*💬 Notable Customer Quotes*
• "_[exact customer quote]_" - regarding [brief context]
• "_[exact customer quote]_" - regarding [brief context]
(Choose 2-3 most representative or impactful quotes)

*🎯 Overall Sentiment*
[One or two sentences about overall sentiment]

Important:
- Use numbered lists
- For quotes, use exact customer words (don't modify them)
- Choose quotes that best illustrate the key themes or pain points
- Keep quotes concise, use [...] for trimming if needed
- Use italics (_quote_) for customer quotes`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || "No summary generated";
}
