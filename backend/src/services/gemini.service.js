import { GoogleGenAI } from "@google/genai";
import { BUYING_SIGNAL_PROMPT } from "../prompts/buyingSignals.prompt.js";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeArticle(article) {

  try {

    const prompt = `
${BUYING_SIGNAL_PROMPT}

TITLE:
${article.title}

DESCRIPTION:
${article.description}

CONTENT:
${article.content}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    let text = response.text;

    text = text.replace(/```json/g, "")
               .replace(/```/g, "")
               .trim();

    return JSON.parse(text);

  } catch (err) {

    console.error(err);

    return {
      qualified: false
    };

  }

}