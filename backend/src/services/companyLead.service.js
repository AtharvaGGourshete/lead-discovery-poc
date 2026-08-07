import { leadProfiles } from "../config/leadProfiles.js";
import { applyFilters } from "../utils/filterEngine.js";
import { determinePriority } from "../utils/leadScorer.js";

function buildReportSignalScore(reportAnalysis = {}) {
  const signals = reportAnalysis.matchedSignals ?? [];
  let score = 0;
  const matched = [];

  for (const signal of signals) {
    const weight =
      leadProfiles.architecture.triggerWeights[signal.type] ?? 0;

    if (weight > 0) {
      score += weight;
      matched.push({
        type: signal.type,
        weight,
        evidence: signal.evidence,
        pattern: signal.pattern
      });
    }
  }

  return {
    score: Math.min(100, score),
    matched
  };
}

export function scoreArchitectureLead(company, finance, reportAnalysis) {
  const filters = applyFilters(finance, finance.financials);
  const reportScore = buildReportSignalScore(reportAnalysis);

  const revenueScore =
    finance.revenue != null && finance.revenue >= leadProfiles.architecture.minimumRevenue
      ? 20
      : 0;

  const growthScore =
    filters.growthPercentage != null && filters.growthPercentage >= 15 ? 15 : 0;

  const leadScore = Math.min(
    100,
    revenueScore +
      growthScore +
      reportScore.score +
      (filters.qualified ? 15 : 0) +
      Math.min(reportAnalysis.signalCount * 3, 10)
  );

  // return {
  //   qualified: filters.qualified && reportAnalysis.hasExpansionPlans,
  //   leadScore,
  //   priority: determinePriority(leadScore),
  //   filters,
  //   reportScore,
  //   matchedSignals: reportScore.matched,
  //   failedReasons: filters.failedReasons,
  //   growthPercentage: filters.growthPercentage
  // };

  const projectQualified =
    reportScore.score >= 70;

return {

    qualified:
        filters.qualified &&
        projectQualified,

    leadScore,

    priority:
        determinePriority(
            leadScore
        ),

    filters,

    reportScore,

    matchedSignals:
        reportScore.matched,

    failedReasons:
        filters.failedReasons,

    growthPercentage:
        filters.growthPercentage

};
}
