import OpenAI from "openai";
import { config } from "../config";

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function summarizeFeedback(
  feedbackItems: string[]
): Promise<string> {
  const prompt = `Analyze the following customer feedback items and provide a concise summary:

${feedbackItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}

Summary should include:
- Key themes and patterns
- Most frequent pain points
- Potential actionable insights
- Tone and sentiment of feedback

Output a structured, professional summary that can be shared with the team.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0].message.content || "No summary generated";
}
