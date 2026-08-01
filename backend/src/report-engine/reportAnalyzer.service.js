import { EVENT_PATTERNS } from "../config/eventTaxanomy.js";

function normalize(text = "") {
  return text.toLowerCase().replace(/\s+/g, " ");
}

function getSnippet(text, index, length = 160) {
  const start = Math.max(0, index - 70);
  const end = Math.min(text.length, index + length);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function buildEvidence(text, pattern, label) {
  const lower = normalize(text);
  const index = lower.indexOf(pattern);
  if (index === -1) return null;

  return {
    label,
    pattern,
    snippet: getSnippet(text, index),
    index
  };
}

function scoreSignals(signals) {
  const uniqueTypes = new Set(signals.map((signal) => signal.type));
  const base = Math.min(35, signals.length * 8);
  const diversity = Math.min(25, uniqueTypes.size * 6);
  const directness = signals.some((signal) =>
    /new|expand|capacity|plant|factory|warehouse|campus|headquarters/i.test(signal.pattern)
  )
    ? 15
    : 0;
  return Math.min(100, base + diversity + directness);
}

export function analyzeReportText(text, companyName = "") {
  const signals = [];
  const lower = normalize(text);

  for (const [type, patterns] of Object.entries(EVENT_PATTERNS)) {
    for (const pattern of patterns) {
      const index = lower.indexOf(pattern);
      if (index === -1) continue;

      const evidence = getSnippet(text, index);
      signals.push({
        type,
        pattern,
        evidence,
        score: Math.min(100, 20 + pattern.length)
      });
      break;
    }
  }

  const capexMatches = [
    "capital expenditure",
    "capex",
    "investment plan",
    "project under implementation",
    "phase 2",
    "commissioned",
    "under construction"
  ].filter((phrase) => lower.includes(phrase));

  if (capexMatches.length > 0 && !signals.some((signal) => signal.type === "Expansion")) {
    signals.push({
      type: "Expansion",
      pattern: capexMatches[0],
      evidence: getSnippet(text, lower.indexOf(capexMatches[0])),
      score: 35
    });
  }

  const evidence = signals
    .slice(0, 8)
    .map((signal) => ({
      type: signal.type,
      pattern: signal.pattern,
      evidence: signal.evidence
    }));

  const confidence = signals.length === 0
    ? 0
    : scoreSignals(signals);

  const hasExpansionPlans = confidence >= 25;

  return {
    companyName,
    hasExpansionPlans,
    confidence,
    signalCount: signals.length,
    matchedSignals: signals,
    evidence,
    summary: hasExpansionPlans
      ? `${companyName || "The company"} shows expansion-related language in the annual report.`
      : `${companyName || "The company"} does not show strong expansion signals in the annual report.`
  };
}
