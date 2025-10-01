import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateQuestions() {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Generate 6 interview questions for a software engineer role:
    - 2 Easy, 2 Medium, 2 Hard.
    Return them in JSON only, no markdown, no explanations.
    [
      { "difficulty": "easy", "text": "..." },
      ...
    ]
    `;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();

  // 🧹 Clean Markdown fences if Gemini still adds them
  if (text.startsWith("```")) {
    text = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error("Failed to parse Gemini output", text);
    return [];
  }
}

export async function scoreAnswer(
  question: string,
  answer: string,
  difficulty: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  Question: ${question}
  Candidate Answer: ${answer}
  Difficulty: ${difficulty}

  Score the answer from 0 to 10.
  Respond strictly in JSON:
  { "score": number, "feedback": string }
  `;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error("Failed to parse Gemini output", text);
    return { score: 0, feedback: "Could not evaluate." };
  }
}

export async function summarizeInterview(
  qa: { question: string; answer: string; score: number }[]
) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  Summarize this candidate's interview performance and give an overall score (0–100).
  Input: ${JSON.stringify(qa)}

  Respond strictly in JSON:
  { "finalScore": number, "summary": string }
  `;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();
  }

  try {
    return JSON.parse(text);
  } catch {
    console.error("Failed to parse Gemini output", text);
    return { finalScore: 0, summary: "Summary not available." };
  }
}
