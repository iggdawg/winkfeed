import { FeedTile } from '../models/Tile';

// Using a free open-source mirror of NewsAPI for demonstration purposes
const NEWS_API_URL = 'https://saurav.tech/NewsAPI/top-headlines/category/technology/us.json';

export async function fetchNewsFeed(topics: string[], blacklistedSources: string[]): Promise<FeedTile[]> {
  try {
    const response = await fetch(NEWS_API_URL);
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const json = await response.json();
    const articles = json.articles || [];

    return articles
      .filter((article: any) => article.title && article.url) // ensure basic valid data
      .filter((article: any) => {
        // Blacklist filter
        if (blacklistedSources.length > 0) {
          const sourceName = article.source?.name?.toLowerCase() || '';
          const isBlacklisted = blacklistedSources.some(b => sourceName.includes(b.toLowerCase()));
          if (isBlacklisted) return false;
        }

        // Topics filter (if topics array is not empty, require at least one match)
        if (topics.length > 0) {
          const title = article.title.toLowerCase();
          const description = (article.description || '').toLowerCase();
          const hasTopic = topics.some(t => {
            const topic = t.toLowerCase();
            return title.includes(topic) || description.includes(topic);
          });
          if (!hasTopic) return false;
        }

        // Time filter (48 hours)
        if (article.publishedAt) {
          const articleTime = new Date(article.publishedAt).getTime();
          const cutoffTime = Date.now() - (48 * 60 * 60 * 1000);
          if (articleTime < cutoffTime) return false;
        }

        return true;
      })
      .map((article: any, index: number) => {
        // Extract domain from URL for the favicon
        let domain = '';
        try {
          domain = new URL(article.url).hostname;
        } catch (e) {
          // Fallback if URL is invalid
          const match = article.url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
          if (match) domain = match[1];
        }
        const sourceIconUrl = domain ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}` : undefined;

        return {
          id: `news_${index}_${new Date(article.publishedAt || Date.now()).getTime()}`,
          source: 'news',
          title: article.title,
          description: article.description,
          imageUrl: article.urlToImage,
          author: article.source?.name || 'News',
          timestamp: article.publishedAt || new Date().toISOString(),
          url: article.url,
          sourceIconUrl,
        };
      });
  } catch (error) {
    console.error('Error fetching News feed:', error);
    return [];
  }
}
