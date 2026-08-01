import { searchInvestorRelations } from "../services/search.service.js";

export async function findAnnualReport(company) {

    const results =
        await searchInvestorRelations(company);

    if (!results) {

        return null;

    }

    for (const result of results) {

        const url = result.link.toLowerCase();

        if (

            url.includes("annual") ||

            url.includes("investor") ||

            url.endsWith(".pdf")

        ) {

            return {

                title: result.title,

                url: result.link,

                snippet: result.snippet

            };

        }

    }

    return null;

}