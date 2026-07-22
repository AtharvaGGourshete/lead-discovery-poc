export function createCompanyModel(aiResult, article){

    return {

        company: aiResult.company,

        industry: aiResult.industry,

        sector: aiResult.sector || "",

        location: aiResult.location,

        summary: aiResult.summary,

        events: aiResult.events,

        articles:[
            {
                title:article.title,
                url:article.url,
                source:article.source,
                publishedAt:article.publishedAt
            }
        ]

    };

}