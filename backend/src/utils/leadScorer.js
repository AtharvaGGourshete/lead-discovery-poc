// export function calculateLeadScore(company) {

//     let score = 0;

//     const uniqueSignals = new Set(company.buyingSignals);

//     score += uniqueSignals.size * 15;

//     score += company.articles.length * 10;

//     const avgConfidence =
//         company.confidences.reduce((a, b) => a + b, 0) /
//         company.confidences.length;

//     score += avgConfidence;

//     return Math.min(100, Math.round(score));

// }

// export function determinePriority(score){

//     if(score>=80)
//         return "HIGH";

//     if(score>=60)
//         return "MEDIUM";

//     return "LOW";

// }

export function calculateLeadScore(company) {

    let score = 0;

    // -------------------------
    // Project Type Score
    // -------------------------

    switch (company.projectType) {

        case "New Headquarters":
        case "Corporate Office":
            score += 35;
            break;

        case "Office Expansion":
            score += 30;
            break;

        case "Manufacturing Plant":
        case "Factory":
            score += 35;
            break;

        case "Warehouse":
        case "Distribution Centre":
        case "Logistics Hub":
            score += 28;
            break;

        case "Hospital":
            score += 35;
            break;

        case "Hotel":
            score += 32;
            break;

        case "Retail Expansion":
        case "Shopping Mall":
            score += 28;
            break;

        case "IT Campus":
        case "Technology Park":
        case "Business Park":
            score += 34;
            break;

        case "Data Centre":
            score += 35;
            break;

        case "Industrial Park":
            score += 30;
            break;

        default:
            score += 15;
    }

    // -------------------------
    // Opportunity Level
    // -------------------------

    switch (company.estimatedOpportunity) {

        case "High":
            score += 20;
            break;

        case "Medium":
            score += 10;
            break;

        case "Low":
            score += 5;
            break;
    }

    // -------------------------
    // Multiple Articles
    // -------------------------

    score += Math.min(company.articles.length * 5, 15);

    // -------------------------
    // Multiple Events
    // -------------------------

    score += Math.min(company.events.length * 3, 12);

    // -------------------------
    // Multiple Services
    // -------------------------

    score += Math.min(company.services.length * 2, 8);

    // -------------------------
    // Financial Growth Bonus
    // -------------------------

    if (company.growthPercentage >= 30)
        score += 10;

    else if (company.growthPercentage >= 15)
        score += 7;

    else if (company.growthPercentage >= 5)
        score += 4;

    // -------------------------
    // Financial Filter Bonus
    // -------------------------

    if (company.qualifiedLead)
        score += 10;

    return Math.min(100, Math.round(score));
}

export function determinePriority(score) {

    if (score >= 85)
        return "HIGH";

    if (score >= 65)
        return "MEDIUM";

    return "LOW";
}