// import yahooFinance from "yahoo-finance2";

// export async function searchCompany(company) {

//     const result = await yahooFinance.search(company);

//     return result;
// }

import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

/**
 * Search Yahoo Finance and enrich a company with
 * financial and profile information.
 */
export async function enrichCompany(companyName) {
  try {
    // Step 1: Search company
    const searchResult = await yahooFinance.search(companyName);

    if (!searchResult.quotes || searchResult.quotes.length === 0) {
      return null;
    }

    // Pick first matching company
    const search = companyName.trim().toLowerCase();

const indianMatches = searchResult.quotes.filter(q =>
    q.quoteType === "EQUITY" &&
    (q.exchange === "NSI" || q.exchange === "BSE")
);

// 1. Exact company name match
let company = indianMatches.find(q =>
    (
        q.shortname?.trim().toLowerCase() === search ||
        q.longname?.trim().toLowerCase() === search
    )
);

// 2. Name starts with search text
if (!company) {
    company = indianMatches.find(q =>
        q.shortname?.toLowerCase().startsWith(search) ||
        q.longname?.toLowerCase().startsWith(search)
    );
}

// 3. Name contains search text
if (!company) {
    company = indianMatches.find(q =>
        q.shortname?.toLowerCase().includes(search) ||
        q.longname?.toLowerCase().includes(search)
    );
}

// 4. Highest relevance Indian equity
if (!company && indianMatches.length > 0) {
    company = indianMatches.sort((a, b) => b.score - a.score)[0];
}

// 5. Final fallback
if (!company) {
    company = searchResult.quotes[0];
}

const symbol = company.symbol;
    searchResult.quotes[0];

    console.table(
    searchResult.quotes.map(q => ({
        symbol: q.symbol,
        shortname: q.shortname,
        longname: q.longname,
        exchange: q.exchange,
        score: q.score,
        quoteType: q.quoteType
    }))
);

    // Step 2: Fetch detailed information
    const details = await yahooFinance.quoteSummary(symbol, {
      modules: [
        "price",
        "assetProfile",
        "financialData",
        "defaultKeyStatistics",
      ],
    });

    return {
      symbol,

      companyName:
        details.price?.longName ??
        company.shortname ??
        companyName,

      exchange:
        details.price?.exchangeName ??
        company.exchange,

      sector:
        details.assetProfile?.sector ?? null,

      industry:
        details.assetProfile?.industry ?? null,

      country:
        details.assetProfile?.country ?? null,

      website:
        details.assetProfile?.website ?? null,

      employees:
        details.assetProfile?.fullTimeEmployees ?? null,

      marketCap:
        details.price?.marketCap ??
        details.defaultKeyStatistics?.marketCap ??
        null,

      revenue:
        details.financialData?.totalRevenue ?? null,

      revenueGrowth:
        details.financialData?.revenueGrowth ?? null,

      earningsGrowth:
        details.financialData?.earningsGrowth ?? null,

      operatingMargins:
        details.financialData?.operatingMargins ?? null,

      returnOnEquity:
        details.financialData?.returnOnEquity ?? null,
    };
  } catch (err) {
    console.error(
      `Yahoo Finance Error (${companyName})`,
      err.message
    );

    return null;
  }
}