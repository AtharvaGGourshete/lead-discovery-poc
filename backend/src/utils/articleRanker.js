const POSITIVE = {
    "corporate office": 20,
    "headquarters": 20,
    "office expansion": 20,
    "new office": 18,
    "campus": 18,
    "factory": 18,
    "manufacturing": 18,
    "plant": 18,
    "warehouse": 16,
    "distribution centre": 16,
    "distribution center": 16,
    "logistics hub": 16,
    "industrial park": 15,
    "technology park": 15,
    "data centre": 15,
    "data center": 15,
    "commercial building": 15,
    "leased": 15,
    "lease": 15,
    "sq ft": 15,
    "square feet": 15,
    "inauguration": 10
};

const NEGATIVE = {
    "death": -100,
    "dead": -100,
    "dies": -100,
    "murder": -100,
    "accident": -100,
    "movie": -100,
    "film": -100,
    "box office": -100,
    "actor": -100,
    "actress": -100,
    "police": -100,
    "minister": -80,
    "politics": -80,
    "election": -80,
    "cricket": -100,
    "football": -100,
    "tennis": -100,
//     "president",
// "secretary",
// "meeting",
// "delegation",
// "summit",
// "conference",
// "ceremony",
// "know bjp",
// "minister",
// "government",
// "chief minister",
// "prime minister"
};

export function scoreArticles(articles) {

    return articles
        .map(article => {

            const text =
                `${article.title} ${article.description ?? ""}`.toLowerCase();

            let score = 0;

            for (const [keyword, value] of Object.entries(POSITIVE)) {
                if (text.includes(keyword))
                    score += value;
            }

            for (const [keyword, value] of Object.entries(NEGATIVE)) {
                if (text.includes(keyword))
                    score += value;
            }

            return {
                ...article,
                rankingScore: score
            };

        })
        .sort((a, b) => b.rankingScore - a.rankingScore);

}