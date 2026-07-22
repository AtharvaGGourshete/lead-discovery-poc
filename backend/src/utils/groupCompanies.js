export function groupCompanies(leads) {

    const companies = {};

    for (const lead of leads) {

        const name = lead.company?.trim();

        if (!name) continue;

        if (!companies[name]) {

            companies[name] = {
                company: name,
                industry: lead.industry,
                articles: [],
                buyingSignals: [],
                priorities: [],
                reasons: [],
                confidences: []
            };

        }

        companies[name].articles.push({
            title: lead.article.title,
            url: lead.article.url,
            publishedAt: lead.article.publishedAt
        });

        companies[name].buyingSignals.push(lead.buyingSignal);

        companies[name].priorities.push(lead.priority);

        companies[name].reasons.push(lead.reason);

        companies[name].confidences.push(lead.confidence);

    }

    return Object.values(companies);

}