import { SEARCH_QUERIES } from "../config/searchQueries.js";
import { fetchNews } from "./gnews.service.js";
import { analyzeArticle } from "./llm.service.js";
import { enrichCompany } from "./indianApi.service.js";
import { deduplicateArticles } from "../utils/deduplicate.js";
import { groupCompanies } from "../utils/groupCompanies.js";
import { applyFilters } from "../utils/filterEngine.js";
import { calculateLeadScore, determinePriority } from "../utils/leadScorer.js";
import { scoreArticles } from "../utils/articleRanker.js";

export async function discoverLeads() {
  let allArticles = [];
  const financeCache = new Map();

  console.log("========== FETCHING NEWS ==========");

  // Fetch articles from all search queries
  for (const query of SEARCH_QUERIES) {
    const articles = await fetchNews(query);
    allArticles.push(...articles);
    await new Promise(resolve => setTimeout(resolve, 1500)); // GNews rate limit
  }
  console.log(`Fetched ${allArticles.length} articles`);

  // Remove duplicates
  allArticles = deduplicateArticles(allArticles);
  console.log(`After dedupe: ${allArticles.length}`);

  // Rank and filter articles
  allArticles = scoreArticles(allArticles);
  const DEMO_ARTICLE_LIMIT = 20;
  const TARGET_QUALIFIED_LEADS = 3;
  const articlesToProcess = allArticles
    .filter(article => article.rankingScore > 0)
    .slice(0, DEMO_ARTICLE_LIMIT);
  console.log(`Processing ${articlesToProcess.length} article(s). Stop after ${TARGET_QUALIFIED_LEADS} verified lead(s).`);

  const qualified = [];
  const unverified = [];

  // Process each article
  for (const article of articlesToProcess) {
    console.log(`Processing (Score: ${article.rankingScore}) -> ${article.title}`);

    const result = await analyzeArticle(article);
    console.log(article.title);
    console.log(result);
    await new Promise(resolve => setTimeout(resolve, 2500)); // LLM RPM limit

    // Skip non-qualified articles
    if (!result?.qualified || !result.company) continue;

    try {
      // Get company financials (cached)
      let finance = financeCache.get(result.company);
      if (!financeCache.has(result.company)) {
        console.log(`Checking company: ${result.company}`);
        finance = await enrichCompany(result.company);
        financeCache.set(result.company, finance);
      } else {
        console.log(`Using cached company: ${result.company}`);
      }

      // Check if company is listed
      if (!finance.listed) {
        console.log(`${result.company} is not listed on NSE/BSE`);
        unverified.push({
          ...result,
          article,
          finance,
          financialVerification: false,
          reason: "Company is not listed on NSE/BSE"
        });
        continue;
      }

      // Check if financials are available
      if (!finance.financialVerification) {
        console.log(`Financial statements unavailable for ${result.company}`);
        unverified.push({
          ...result,
          article,
          finance,
          financialVerification: false,
          reason: "Financial statements unavailable"
        });
        continue;
      }

      // Apply financial filters
      const filterResult = applyFilters(finance, finance.financials);
      if (!filterResult.qualified) {
        console.log(`${result.company} failed financial filters`);
        continue;
      }

      // Add as verified lead
      qualified.push({
        ...result,
        article,
        finance,
        financialVerification: true,
        qualifiedLead: true,
        filters: filterResult.filters,
        growthPercentage: filterResult.growthPercentage,
        failedReasons: filterResult.failedReasons
      });
      console.log(`Verified Lead: ${result.company}`);

      // Stop if target reached
      if (qualified.length >= TARGET_QUALIFIED_LEADS) {
        console.log(`Reached target of ${TARGET_QUALIFIED_LEADS} verified leads`);
        break;
      }
    } catch (err) {
      console.error(`Failed processing ${result.company}:`, err.message);
    }
  }

  console.log(`Verified Leads: ${qualified.length}`);
  console.log(`Unverified Leads: ${unverified.length}`);

  // Group companies
  const verifiedCompanies = groupCompanies(qualified);
  const unverifiedCompanies = groupCompanies(unverified);
  console.log(`Verified Companies: ${verifiedCompanies.length}`);
  console.log(`Unverified Companies: ${unverifiedCompanies.length}`);

  // Score and format verified leads
  const verifiedLeads = verifiedCompanies.map(company => {
    const score = calculateLeadScore(company);
    return {
      company: company.company,
      industry: company.industry,
      sector: company.sector,
      location: company.location,
      projectType: company.projectType,
      constructionRequired: company.constructionRequired,
      estimatedOpportunity: company.estimatedOpportunity,
      services: company.services,
      summary: company.summary,
      leadScore: score,
      priority: determinePriority(score),
      buyingSignals: [...new Set(company.buyingSignals)],
      evidenceCount: company.articles.length,
      reasons: [...new Set(company.reasons)],
      events: company.events,
      articles: company.articles,
      finance: company.finance,
      revenue: company.finance?.revenue,
      marketCap: company.finance?.marketCap,
      analystRating: company.finance?.analystRating,
      currentPrice: company.finance?.currentPrice,
      exchangeCodeNse: company.finance?.exchangeCodeNse,
      exchangeCodeBse: company.finance?.exchangeCodeBse,
      financialVerification: true,
      qualified: true,
      filters: company.filters,
      growthPercentage: company.growthPercentage,
      failedReasons: company.failedReasons
    };
  });

  // Format unverified leads
  const unverifiedLeads = unverifiedCompanies.map(company => ({
    company: company.company,
    industry: company.industry,
    sector: company.sector,
    location: company.location,
    projectType: company.projectType,
    constructionRequired: company.constructionRequired,
    estimatedOpportunity: company.estimatedOpportunity,
    services: company.services,
    summary: company.summary,
    buyingSignals: [...new Set(company.buyingSignals)],
    evidenceCount: company.articles.length,
    reasons: [...new Set(company.reasons)],
    events: company.events,
    articles: company.articles,
    finance: company.finance,
    financialVerification: false,
    reason: company.reason ?? "Company could not be financially verified"
  }));

  return {
    verifiedLeads,
    unverifiedLeads,
    stats: {
      articlesFetched: allArticles.length,
      articlesProcessed: articlesToProcess.length,
      verifiedCompanies: verifiedLeads.length,
      unverifiedCompanies: unverifiedLeads.length
    }
  };
}