import OpenAI from "openai";
import { config } from "../config";

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function summarizeFeedback(
  feedbackItems: string[]
): Promise<string> {
  const prompt = `Analyze the following customer feedback items and provide a concise summary:

${feedbackItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Ignore any feedback talking about pricing, billing, or other non-product related issues.

Format your response exactly like this example, using Slack markdown:

*📈 Key Themes*
1. Theme point 1
2. Theme point 2

*❗ Pain Points*
1. Pain point 1
2. Pain point 2

*💡 Actionable Insights*
3. Action item 1
4. Action item 2

*🎯 Overall Sentiment*
[One or two sentences about overall sentiment]

Keep it concise and use numbered points (•) for lists. Don't use markdown bold (**) or unordered lists.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || "No summary generated";
}
