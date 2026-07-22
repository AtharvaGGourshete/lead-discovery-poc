import axios from "axios";

const BASE_URL = "https://gnews.io/api/v4/search";

export async function fetchNews(query) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: query,
        lang: "en",
        country: "in",
        max: 10,
        token: process.env.GNEWS_API_KEY
      }
    });

    return response.data.articles.map(article => ({
      title: article.title,
      description: article.description,
      content: article.content || "",
      url: article.url,
      image: article.image,
      publishedAt: article.publishedAt,
      source: article.source?.name || "GNews"
    }));

  } catch (err) {
    console.error(`GNews Error (${query})`, err.message);
    return [];
  }
}