// import axios from "axios";

// const BASE_URL = "https://gnews.io/api/v4/search";

// export async function fetchNews(query) {
//   try {
//     const response = await axios.get(BASE_URL, {
//       params: {
//         q: query,
//         lang: "en",
//         country: "in",
//         max: 10,
//         token: process.env.GNEWS_API_KEY
//       }
//     });

//     return response.data.articles.map(article => ({
//       title: article.title,
//       description: article.description,
//       content: article.content || "",
//       url: article.url,
//       image: article.image,
//       publishedAt: article.publishedAt,
//       source: article.source?.name || "GNews"
//     }));

//   } catch (err) {
//     console.error(`GNews Error (${query})`, err.message);
//     return [];
//   }
// }

import axios from "axios";

const BASE_URL = "https://gnews.io/api/v4/search";

export async function fetchNews(query) {

    try {

        let response;

        // Retry on rate limiting
        for (let attempt = 1; attempt <= 3; attempt++) {

            try {

                response = await axios.get(
                    BASE_URL,
                    {
                        params: {
                            q: query,
                            lang: "en",
                            country: "in",
                            max: 10,
                            token: process.env.GNEWS_API_KEY,
                        },
                    }
                );

                break;

            } catch (err) {

                const status =
                    err.response?.status;

                if (
                    status === 429 &&
                    attempt < 3
                ) {

                    const delay =
                        attempt * 3000;

                    console.warn(
                        `GNews rate limit for "${query}". Retrying in ${delay / 1000} seconds...`
                    );

                    await new Promise(
                        (resolve) =>
                            setTimeout(
                                resolve,
                                delay
                            )
                    );

                    continue;

                }

                throw err;

            }

        }

        const articles =
            response?.data?.articles ?? [];

        return articles.map((article) => ({

            title:
                article.title,

            description:
                article.description,

            content:
                article.content || "",

            url:
                article.url,

            image:
                article.image,

            publishedAt:
                article.publishedAt,

            source:
                article.source?.name ??
                "GNews",

        }));

    } catch (err) {

        console.error(
            `GNews Error (${query}):`,
            err.response?.data ||
                err.message
        );

        return [];

    }

}