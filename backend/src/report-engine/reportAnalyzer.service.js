import { EVENT_PATTERNS } from "../config/eventTaxanomy.js";

function normalize(text = "") {
  return text.toLowerCase().replace(/\s+/g, " ");
}

function splitIntoParagraphs(text = "") {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 80);
}

const POSITIVE_KEYWORDS = {
    "capex": 10,
    "capital expenditure": 12,
    "expansion": 8,
    "greenfield": 18,
    "brownfield": 18,
    "manufacturing facility": 20,
    "manufacturing plant": 20,
    "factory": 15,
    "warehouse": 15,
    "distribution centre": 15,
    "distribution center": 15,
    "office lease": 20,
    "leased": 20,
    "campus": 15,
    "land acquisition": 25,
    "land acquired": 25,
    "construction": 15,
    "project": 8,
    "investment": 10,
    "capacity expansion": 18
};

const NEGATIVE_KEYWORDS = {
    "auditor": -40,
    "audit": -40,
    "corporate governance": -40,
    "risk management": -35,
    "remuneration": -35,
    "csr": -30,
    "shareholder": -30,
    "financial statements": -40,
    "dividend": -25,
    "compliance": -25
};

function scoreParagraph(paragraph) {

    const text = normalize(paragraph);

    let score = 0;

    for (const [word, value] of Object.entries(POSITIVE_KEYWORDS)) {
        if (text.includes(word))
            score += value;
    }

    for (const [word, value] of Object.entries(NEGATIVE_KEYWORDS)) {
        if (text.includes(word))
            score += value;
    }

    return score;
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

function extractEvidence(paragraph, keyword) {

    const sentences =
        paragraph.split(/(?<=[.!?])\s+/);

    const index = sentences.findIndex(sentence =>
        sentence
            .toLowerCase()
            .includes(keyword.toLowerCase())
    );

    if (index === -1)
        return paragraph.substring(0, 250);

    const start = Math.max(0, index - 1);
    const end = Math.min(
        sentences.length,
        index + 2
    );

    return sentences
        .slice(start, end)
        .join(" ");
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

const paragraphs = splitIntoParagraphs(text);

const rankedParagraphs = paragraphs
    .map(paragraph => ({
        paragraph,
        score: scoreParagraph(paragraph)
    }))
    .filter(item => item.score >= 10)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

for (const item of rankedParagraphs) {

    const lower = normalize(item.paragraph);

    for (const [type, patterns] of Object.entries(EVENT_PATTERNS)) {

        for (const pattern of patterns) {

            if (!lower.includes(pattern))
                continue;

            const evidence = extractEvidence(
                  item.paragraph,
                  pattern
              );

              // Reject obvious false positives
              if (
                  /auditor|audit|corporate governance|risk management|remuneration|csr|shareholder|dividend|financial statements/i.test(evidence)
              ) {
                  continue;
              }

              signals.push({

                  type,

                  pattern,

                  evidence,

                  score: item.score

              });

            // signals.push({

            //     type,

            //     pattern,

            //     evidence: item.paragraph,

            //     score: item.score

            // });

            break;
        }
    }
}

  const evidence = signals
    .slice(0, 8)
    .map((signal) => ({
      type: signal.type,
      pattern: signal.pattern,
      evidence: signal.evidence
    }));

  const confidence =
    signals.length === 0
    ? 0
    : Math.min(
        100,
        Math.max(...signals.map(s => s.score))
    );
    
  const hasExpansionPlans = signals.some(signal => signal.score >= 25);

  return {
    companyName,
    hasExpansionPlans,
    confidence,
    signalCount: signals.length,
    matchedSignals: signals,
    evidence,
    summary: hasExpansionPlans
    ? `${companyName || "The company"} has potential infrastructure or expansion projects identified from the annual report.`
    : `${companyName || "The company"} does not contain strong project or expansion evidence in the annual report.`
  };
}
