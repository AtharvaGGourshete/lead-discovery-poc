// import { SEARCH_QUERIES } from "../config/searchQueries.js";
// import { fetchNews } from "./gnews.service.js";
// import { analyzeArticle } from "./gemini.service.js";
// import { deduplicateArticles } from "../utils/deduplicate.js";
// import { groupCompanies } from "../utils/groupCompanies.js";
// import { calculateLeadScore } from "../utils/leadScorer.js";
// import { determinePriority } from "../utils/leadScorer.js";

// export async function discoverLeads() {
//   let allArticles = [];

//   for (const query of SEARCH_QUERIES) {
//     console.log(`Searching: ${query}`);

//     const news = await fetchNews(query);

//     allArticles.push(...news);
//   }

//   console.log(`Fetched ${allArticles.length} articles`);

//   allArticles = deduplicateArticles(allArticles);

//   console.log(`After dedupe: ${allArticles.length}`);

//   const qualified = [];

//   for (const article of allArticles) {
//     console.log(`Analyzing: ${article.title}`);

//     const result = await analyzeArticle(article);

//     console.log(result);

//     if (result.qualified) {
//       qualified.push({
//         ...result,
//         article,
//       });
//     }
//   }

//   const companies = groupCompanies(qualified);

//   const finalLeads = companies.map((company) => {
//     const score = calculateLeadScore(company);

//     return {
//       company: company.company,

//       industry: company.industry,

//       leadScore: score,

//       priority: determinePriority(score),

//       buyingSignals: [...new Set(company.buyingSignals)],

//       evidenceCount: company.articles.length,

//       reasons: company.reasons,

//       articles: company.articles,
//     };
//   });

//   return finalLeads;
// }

import { SEARCH_QUERIES } from "../config/searchQueries.js";
import { fetchNews } from "./gnews.service.js";
import { analyzeArticle } from "./gemini.service.js";
import { enrichCompany } from "./indianApi.service.js";
import { deduplicateArticles } from "../utils/deduplicate.js";
import { groupCompanies } from "../utils/groupCompanies.js";
import { applyFilters } from "../utils/filterEngine.js";
import {
  calculateLeadScore,
  determinePriority,
} from "../utils/leadScorer.js";

export async function discoverLeads() {
  let allArticles = [];

  // Cache financial lookups
  const financeCache = new Map();

  console.log("========== FETCHING NEWS ==========");

  for (const query of SEARCH_QUERIES) {

    const articles =
        await fetchNews(query);

    allArticles.push(...articles);

    // Delay between GNews requests
    await new Promise(resolve =>
        setTimeout(resolve, 1500)
    );

}

  console.log(`Fetched ${allArticles.length} articles`);

  // Remove duplicate articles
  allArticles = deduplicateArticles(allArticles);

  console.log(`After dedupe: ${allArticles.length}`);

  // -----------------------------
  // DEMO MODE
  // Analyse only first 3 articles
  // -----------------------------
  const DEMO_ARTICLE_LIMIT = 20;
const TARGET_QUALIFIED_LEADS = 3;

const articlesToProcess = allArticles.slice(
    0,
    DEMO_ARTICLE_LIMIT
);

console.log(
    `Processing up to ${articlesToProcess.length} article(s) (Stop after ${TARGET_QUALIFIED_LEADS} qualified lead(s))`
);

  const qualified = [];

  for (const article of articlesToProcess) {

    const result = await analyzeArticle(article);

    const location =
    result.location?.toLowerCase() || "";

if (
    result.qualified &&
    !location.includes("india")
) {
    result.qualified = false;
}

    // Small delay to avoid Gemini RPM limits
    await new Promise(resolve =>
        setTimeout(resolve, 2500)
    );


    // Skip if Gemini doesn't detect an architecture opportunity
    if (!result?.qualified || !result.company) {
      continue;
    }

    try {
      let finance = financeCache.get(result.company);

if (!financeCache.has(result.company)) {

    console.log(
        `Fetching financials for ${result.company}`
    );

    finance = await enrichCompany(result.company);

    financeCache.set(
        result.company,
        finance
    );

} else {

    console.log(
        `Using cached financials for ${result.company}`
    );

}

let filterResult = {

    qualified: true,

    financialVerification: false,

    filterScore: 0,

    growthPercentage: null,

    filters: {

        financialVerification: {

            passed: false,

            value: "Unavailable",

            message:
                "Private or unlisted company. Financial verification unavailable."

        }

    },

    failedReasons: []

};

if (finance) {

    filterResult = applyFilters(
        finance,
        finance.financials
    );

    filterResult.financialVerification = true;

} else {

    console.log(
        `No financial data for ${result.company}. Keeping as unverified lead.`
    );

}

qualified.push({

    ...result,

    article,

    finance,

    qualifiedLead:
        result.qualified &&
        (
            filterResult.financialVerification
                ? filterResult.qualified
                : true
        ),

    financialVerification:
        filterResult.financialVerification,

    filters:
        filterResult.filters,

    growthPercentage:
        filterResult.growthPercentage,

    failedReasons:
        filterResult.failedReasons

});
    } catch (err) {
      console.error(
        `Failed processing ${result.company}:`,
        err.message
      );
    }
  }

  console.log(
    `Qualified Articles After Gemini: ${qualified.length}`
  );

  // Merge multiple articles belonging to the same company
  const companies = groupCompanies(qualified);

  // Keep only companies passing financial filters
  const filteredCompanies = companies.filter(
    (company) => company.qualifiedLead
  );

  console.log(
    `Qualified Companies: ${filteredCompanies.length}`
  );

  const finalLeads = filteredCompanies.map((company) => {
    const score = calculateLeadScore(company);

    return {
      company: company.company,

      industry: company.industry,

      sector: company.sector,

      location: company.location,

      projectType: company.projectType,

      constructionRequired:
        company.constructionRequired,

      estimatedOpportunity:
        company.estimatedOpportunity,

      services: company.services,

      summary: company.summary,

      leadScore: score,

      priority: determinePriority(score),

      buyingSignals: [
        ...new Set(company.buyingSignals),
      ],

      evidenceCount: company.articles.length,

      reasons: [
        ...new Set(company.reasons),
      ],

      events: company.events,

      articles: company.articles,

      finance: company.finance,

      revenue: company.finance?.revenue,

      marketCap: company.finance?.marketCap,

      analystRating:
        company.finance?.analystRating,

      currentPrice:
        company.finance?.currentPrice,

      exchangeCodeNse:
        company.finance?.exchangeCodeNse,

      exchangeCodeBse:
        company.finance?.exchangeCodeBse,

      qualified: company.qualifiedLead,

      filters: company.filters,

      growthPercentage:
        company.growthPercentage,

      failedReasons:
        company.failedReasons,
    };
  });

  return finalLeads;
}
