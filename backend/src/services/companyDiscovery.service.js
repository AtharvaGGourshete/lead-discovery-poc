import listedCompanies from "../data/nse-listed-companies.json" with { type: "json" };
import { enrichCompany, getListedCompany } from "./indianApi.service.js";

function normalizeCompanyName(name = "") {
  return name
    .toLowerCase()
    .replace(/\b(private|public|limited|ltd|pvt|plc|inc|corporation|corp)\b/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(name = "") {
  return new Set(
    normalizeCompanyName(name)
      .split(" ")
      .filter(Boolean)
  );
}

function similarityScore(a = "", b = "") {
  const left = tokenSet(a);
  const right = tokenSet(b);

  if (left.size === 0 || right.size === 0) return 0;

  let intersection = 0;

  for (const token of left) {
    if (right.has(token)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(left.size, right.size);
}

function findBestListedCompany(companyName) {
  const exact = getListedCompany(companyName);
  if (exact) {
    return {
      matchType: "exact",
      score: 1,
      company: exact
    };
  }

  const normalizedQuery = normalizeCompanyName(companyName);
  let bestMatch = null;
  let bestScore = 0;

  for (const company of listedCompanies) {
    const score = similarityScore(normalizedQuery, company.company_name);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = company;
    }
  }

  if (!bestMatch || bestScore < 0.34) {
    return null;
  }

  return {
    matchType: "fuzzy",
    score: Number(bestScore.toFixed(2)),
    company: bestMatch
  };
}

export async function discoverCompany(companyName) {
  if (!companyName || !companyName.trim()) {
    throw new Error("company name is required");
  }

  const match = findBestListedCompany(companyName);
  const financeLookupName = match?.company?.company_name || companyName;
  const finance = await enrichCompany(financeLookupName);

  return {
    input: companyName.trim(),
    normalizedInput: normalizeCompanyName(companyName),
    listed: Boolean(match),
    match,
    finance,
    confidence: match?.score ?? 0,
    companyName: finance.companyName ?? match?.company?.company_name ?? companyName.trim()
  };
}
