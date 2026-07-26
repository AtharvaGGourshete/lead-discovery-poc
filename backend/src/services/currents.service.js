import axios from "axios";
import dotenv from "dotenv";
import { SEARCH_QUERIES } from "../config/searchQueries.js";

dotenv.config();

const BASE_URL = "https://api.currentsapi.services/v1/search";

const delay = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

export async function fetchNews() {

    const allArticles = [];

    for (const query of SEARCH_QUERIES) {

        try {

            console.log(`Searching: ${query}`);

            const response = await axios.get(BASE_URL, {

                params: {
                    keywords: query,
                    language: "en",
                    country: "IN"
                },

                headers: {
                    Authorization:
                        process.env.CURRENTS_API_KEY
                }

            });

            const articles =
                response.data.news || [];

            console.log(
                `Found ${articles.length} articles`
            );

            allArticles.push(

                ...articles.map(article => ({

                    title: article.title,

                    description:
                        article.description,

                    content:
                        article.description,

                    url:
                        article.url,

                    image:
                        article.image,

                    publishedAt:
                        article.published,

                    source:
                        article.author ||

                        article.source ||

                        "Unknown"

                }))

            );

            await delay(1000);

        } catch (err) {

            console.error(

                `Currents API Error (${query}):`,

                err.response?.data ||

                err.message

            );

        }

    }

    const unique = [];

    const seen = new Set();

    for (const article of allArticles) {

        const key =
            article.url ||
            article.title;

        if (!seen.has(key)) {

            seen.add(key);

            unique.push(article);

        }

    }

    console.log(
        `Total unique articles: ${unique.length}`
    );

    return unique;

}