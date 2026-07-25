// import { GoogleGenAI } from "@google/genai";
// import { BUYING_SIGNAL_PROMPT } from "../prompts/buyingSignals.prompt.js";
// import dotenv from "dotenv";
// dotenv.config();

// const ai = new GoogleGenAI({
//   apiKey: process.env.GEMINI_API_KEY,
// });

// export async function analyzeArticle(article) {

//   try {

//     const prompt = `
// ${BUYING_SIGNAL_PROMPT}

// TITLE:
// ${article.title}

// DESCRIPTION:
// ${article.description}

// CONTENT:
// ${article.content}
// `;

//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt
//     });

//     let text = response.text;

//     text = text.replace(/```json/g, "")
//                .replace(/```/g, "")
//                .trim();

//     return JSON.parse(text);

//   } catch (err) {

//     console.error(err);

//     return {
//       qualified: false
//     };

//   }

// }

import { GoogleGenAI } from "@google/genai";
import { BUYING_SIGNAL_PROMPT } from "../prompts/buyingSignals.prompt.js";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function analyzeArticle(article) {

    const prompt = `
${BUYING_SIGNAL_PROMPT}

TITLE:
${article.title}

DESCRIPTION:
${article.description}

CONTENT:
${article.content}
`;

    try {

        let response;

        // Retry on Gemini rate limits
        for (let attempt = 1; attempt <= 3; attempt++) {

            try {

                response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                });

                break;

            } catch (err) {

                const status =
                    err.status ||
                    err.code ||
                    err.response?.status;

                if (status === 429 && attempt < 3) {

                    const delay = attempt * 5000;

                    console.warn(
                        `Gemini rate limit hit. Retrying in ${delay / 1000} seconds...`
                    );

                    await new Promise((resolve) =>
                        setTimeout(resolve, delay)
                    );

                    continue;

                }

                throw err;

            }

        }

        let text = response.text ?? "";

        text = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim();

        try {

            return JSON.parse(text);

        } catch {

            console.error(
                "Gemini returned invalid JSON:"
            );

            console.error(text);

            return {
                qualified: false,
            };

        }

    } catch (err) {

        console.error(
            "Gemini Analysis Error:",
            err.message || err
        );

        return {
            qualified: false,
        };

    }

}