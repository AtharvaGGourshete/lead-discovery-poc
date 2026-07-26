import Groq from "groq-sdk";
import dotenv from "dotenv";
import { BUYING_SIGNAL_PROMPT } from "../prompts/buyingSignals.prompt.js";

dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const MODEL =
    process.env.GROQ_MODEL ||
    "llama-3.3-70b-versatile";

export async function analyzeArticle(article) {

    const prompt = `
${BUYING_SIGNAL_PROMPT}

TITLE:
${article.title}

DESCRIPTION:
${article.description ?? ""}

CONTENT:
${article.content ?? ""}
`;

    try {

        let completion;

        for (let attempt = 1; attempt <= 3; attempt++) {

            try {

                completion =
                    await groq.chat.completions.create({

                        model: MODEL,

                        temperature: 0.1,

                        response_format: {
                            type: "json_object"
                        },

                        messages: [

                            {
                                role: "system",
                                content:
                                    "Return only valid JSON."
                            },

                            {
                                role: "user",
                                content: prompt
                            }

                        ]

                    });

                break;

            } catch (err) {

                if (
                    err.status === 429 &&
                    attempt < 3
                ) {

                    const delay =
                        attempt * 3000;

                    console.log(
                        `Rate limited. Retrying in ${delay} ms...`
                    );

                    await new Promise(resolve =>
                        setTimeout(resolve, delay)
                    );

                    continue;

                }

                throw err;

            }

        }

        const text =
            completion
                .choices[0]
                .message.content
                .trim();

        return JSON.parse(text);

    } catch (err) {

        console.error(
            "Groq Error:",
            err.message
        );

        return {
            qualified: false
        };

    }

}