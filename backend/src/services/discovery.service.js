import { SEARCH_QUERIES } from "../config/searchQueries.js";
import { fetchNews } from "./gnews.service.js";
import { analyzeArticle } from "./gemini.service.js";
import { deduplicateArticles } from "../utils/deduplicate.js";
import { groupCompanies } from "../utils/groupCompanies.js";
import { calculateLeadScore } from "../utils/leadScorer.js";
import { determinePriority } from "../utils/leadScorer.js";

export async function discoverLeads() {
  let allArticles = [];

  for (const query of SEARCH_QUERIES) {
    console.log(`Searching: ${query}`);

    const news = await fetchNews(query);

    allArticles.push(...news);
  }

  console.log(`Fetched ${allArticles.length} articles`);

  allArticles = deduplicateArticles(allArticles);

  console.log(`After dedupe: ${allArticles.length}`);

  const qualified = [];

  for (const article of allArticles) {
    console.log(`Analyzing: ${article.title}`);

    const result = await analyzeArticle(article);

    console.log(result);

    if (result.qualified) {
      qualified.push({
        ...result,
        article,
      });
    }
  }

  const companies = groupCompanies(qualified);

  const finalLeads = companies.map((company) => {
    const score = calculateLeadScore(company);

    return {
      company: company.company,

      industry: company.industry,

      leadScore: score,

      priority: determinePriority(score),

      buyingSignals: [...new Set(company.buyingSignals)],

      evidenceCount: company.articles.length,

      reasons: company.reasons,

      articles: company.articles,
    };
  });

  return finalLeads;
}
