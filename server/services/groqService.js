import axios from "axios";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export function extractJson(text) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    return null;
  }
  const slice = text.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(slice);
  } catch (err) {
    return null;
  }
}

export async function groqChat({ messages, temperature = 0.2, model }) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const response = await axios.post(
    GROQ_URL,
    {
      model: model || process.env.GROQ_MODEL || "llama-3.1-70b-versatile",
      temperature,
      messages,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices?.[0]?.message?.content || "";
}
