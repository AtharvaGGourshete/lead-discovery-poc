export function deduplicateArticles(articles) {

    const seen = new Set();

    return articles.filter(article => {

        const key = article.url;

        if (seen.has(key)) return false;

        seen.add(key);

        return true;

    });

}