import OpenAI from "openai";
import { config } from "../config";

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function summarizeFeedback(
  feedbackItems: string[]
): Promise<string> {
  const prompt = `Analyze the following customer feedback items and provide a summary with only the most important quotes:

${feedbackItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Format your response exactly like this example, using Slack markdown:

*💬 Important Customer Quotes*
1. "_[exact customer quote]_" - regarding [brief context]
2. "_[exact customer quote]_" - regarding [brief context]
(Continue with 10-20 most important quotes)

Important:
- Select 10-20 of the most impactful and representative quotes
- Ignore any feedback talking about pricing, billing, or other non-product related issues
- For quotes, use exact customer words (don't modify them)
- Keep quotes concise, use [...] for trimming if needed
- Use italics (_quote_) for customer quotes
- Each quote should be numbered
- Include brief context for each quote`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content || "No summary generated";
}
