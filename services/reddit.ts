import { FeedTile } from '../models/Tile';

const REDDIT_BASE_URL = 'https://www.reddit.com';

export async function fetchRedditFeed(subreddits: string[]): Promise<FeedTile[]> {
  try {
    const subPath = subreddits.length > 0 ? subreddits.join('+') : 'popular';
    const response = await fetch(`${REDDIT_BASE_URL}/r/${subPath}.json?limit=25`);
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const json = await response.json();
    const children = json.data?.children || [];

    return children.map((child: any) => {
      const data = child.data;
      
      // Determine the best image preview
      let imageUrl = data.url;
      if (imageUrl && !imageUrl.match(/\.(jpeg|jpg|gif|png)$/) && data.preview?.images?.[0]?.source?.url) {
        imageUrl = data.preview.images[0].source.url.replace(/&amp;/g, '&');
      } else if (!imageUrl || !imageUrl.match(/\.(jpeg|jpg|gif|png)$/)) {
        imageUrl = undefined;
      }

      // Extract video URL if it exists
      let videoUrl: string | undefined;
      if (data.is_video && data.secure_media?.reddit_video?.fallback_url) {
        videoUrl = data.secure_media.reddit_video.fallback_url;
      } else if (data.preview?.reddit_video_preview?.fallback_url) {
        videoUrl = data.preview.reddit_video_preview.fallback_url;
      }

      return {
        id: `reddit_${data.id}`,
        source: 'reddit',
        title: data.title,
        description: data.selftext ? data.selftext.substring(0, 200) + (data.selftext.length > 200 ? '...' : '') : undefined,
        imageUrl,
        videoUrl,
        author: `r/${data.subreddit}`,
        timestamp: new Date(data.created_utc * 1000).toISOString(),
        url: `${REDDIT_BASE_URL}${data.permalink}`,
        score: data.score,
      };
    });
  } catch (error) {
    console.error('Error fetching Reddit feed:', error);
    return [];
  }
}
