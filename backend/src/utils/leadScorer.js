export function calculateLeadScore(company) {

    let score = 0;

    const uniqueSignals = new Set(company.buyingSignals);

    score += uniqueSignals.size * 15;

    score += company.articles.length * 10;

    const avgConfidence =
        company.confidences.reduce((a, b) => a + b, 0) /
        company.confidences.length;

    score += avgConfidence;

    return Math.min(100, Math.round(score));

}

export function determinePriority(score){

    if(score>=80)
        return "HIGH";

    if(score>=60)
        return "MEDIUM";

    return "LOW";

}