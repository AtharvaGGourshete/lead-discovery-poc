import yahooFinance from "yahoo-finance2";

export async function searchCompany(company) {

    const result = await yahooFinance.search(company);

    return result;
}