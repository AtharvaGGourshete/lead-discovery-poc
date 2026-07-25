// export function groupCompanies(leads) {

//     const companies = {};

//     for (const lead of leads) {

//         const name = lead.company?.trim();

//         if (!name) continue;

//         if (!companies[name]) {

//             companies[name] = {
//                 company: name,
//                 industry: lead.industry,
//                 articles: [],
//                 buyingSignals: [],
//                 priorities: [],
//                 reasons: [],
//                 confidences: []
//             };

//         }

//         companies[name].articles.push({
//             title: lead.article.title,
//             url: lead.article.url,
//             publishedAt: lead.article.publishedAt
//         });

//         companies[name].buyingSignals.push(lead.buyingSignal);

//         companies[name].priorities.push(lead.priority);

//         companies[name].reasons.push(lead.reason);

//         companies[name].confidences.push(lead.confidence);

//     }

//     return Object.values(companies);

// }

export function groupCompanies(leads) {

    const companies = {};

    for (const lead of leads) {

        const name = lead.company?.trim();

        if (!name) continue;

        if (!companies[name]) {

            companies[name] = {

                company: name,

                industry: lead.industry,

                sector: lead.sector,

                location: lead.location,

                projectType: lead.projectType,

                constructionRequired: lead.constructionRequired,

                estimatedOpportunity: lead.estimatedOpportunity,

                services: lead.services || [],

                summary: lead.summary,

                finance: lead.finance,

                filters: lead.filters,

                qualifiedLead: lead.qualifiedLead,

                growthPercentage: lead.growthPercentage,

                failedReasons: lead.failedReasons,

                articles: [],

                buyingSignals: [],

                priorities: [],

                reasons: [],

                confidences: [],

                events: []

            };

        }

        companies[name].articles.push({

            title: lead.article.title,

            url: lead.article.url,

            publishedAt: lead.article.publishedAt

        });

        if (lead.buyingSignal)
            companies[name].buyingSignals.push(lead.buyingSignal);

        if (lead.priority)
            companies[name].priorities.push(lead.priority);

        if (lead.reason)
            companies[name].reasons.push(lead.reason);

        if (lead.confidence)
            companies[name].confidences.push(lead.confidence);

        if (Array.isArray(lead.events)) {
            companies[name].events.push(...lead.events);
        }

    }

    // Remove duplicate services and event types
    return Object.values(companies).map(company => ({

        ...company,

        services: [...new Set(company.services)],

        buyingSignals: [...new Set(company.buyingSignals)],

        events: company.events.filter(
            (event, index, self) =>
                index === self.findIndex(
                    e =>
                        e.type === event.type &&
                        e.evidence === event.evidence
                )
        )

    }));

}