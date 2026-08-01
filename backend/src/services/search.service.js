import { getJson } from "serpapi";

export async function searchInvestorRelations(company) {
    return new Promise((resolve, reject) => {

        getJson(
            {
                engine: "google",
                q: `${company} investor relations annual report pdf`,
                api_key: process.env.SERP_API_KEY,
                num: 10
            },
            (json) => {

                if (!json.organic_results) {
                    return resolve(null);
                }

                const results = json.organic_results;

                resolve(results);

            }
        );

    });
}