import { BskyAgent } from '@atproto/api';
import { FeedTile } from '../models/Tile';

// Initialize agent
export const bskyAgent = new BskyAgent({
  service: 'https://bsky.social',
});

let isAuthenticated = false;

export async function loginBluesky(identifier?: string, password?: string) {
  if (isAuthenticated) return true;
  if (!identifier || !password) return false;
  
  try {
    await bskyAgent.login({
      identifier,
      password,
    });
    isAuthenticated = true;
    return true;
  } catch (error) {
    console.error('Bluesky login error:', error);
    return false;
  }
}

export async function fetchBlueskyFeed(): Promise<FeedTile[]> {
  try {
    // If not authenticated, we can't fetch the home timeline.
    // As a fallback for demonstration without auth, we could fetch a popular feed.
    // Did you know you can fetch feeds anonymously now? We'll try to fetch the "Discover" feed if not authed.
    
    let feed;
    if (isAuthenticated) {
      const response = await bskyAgent.getTimeline({ limit: 25 });
      feed = response.data.feed;
    } else {
      // Fallback: Fetch a popular public feed (e.g., "Discover" feed from bsky.app)
      // The discover feed URI is usually: at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot
      const response = await bskyAgent.app.bsky.feed.getFeed({
        feed: 'at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot',
        limit: 25,
      });
      feed = response.data.feed;
    }

    return feed.map((item: any) => {
      const post = item.post;
      const author = post.author;
      const record = post.record as any;
      
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;

      if (post.embed) {
        if (post.embed.$type === 'app.bsky.embed.images#view' && post.embed.images?.[0]) {
          imageUrl = post.embed.images[0].thumb;
        } else if (post.embed.$type === 'app.bsky.embed.video#view') {
          videoUrl = post.embed.playlist as string;
          imageUrl = post.embed.thumbnail as string; // fallback thumbnail
        } else if (post.embed.$type === 'app.bsky.embed.recordWithMedia#view' && post.embed.media) {
          if (post.embed.media.$type === 'app.bsky.embed.images#view' && post.embed.media.images?.[0]) {
            imageUrl = post.embed.media.images[0].thumb;
          } else if (post.embed.media.$type === 'app.bsky.embed.video#view') {
            videoUrl = post.embed.media.playlist as string;
            imageUrl = post.embed.media.thumbnail as string;
          }
        }
      }

      // Bluesky URLs are typically constructed like this:
      const postUrl = `https://bsky.app/profile/${author.handle}/post/${post.uri.split('/').pop()}`;

      return {
        id: `bluesky_${post.uri}`,
        source: 'bluesky',
        title: record.text,
        imageUrl,
        videoUrl,
        author: `@${post.author.handle}`,
        authorAvatarUrl: post.author.avatar,
        timestamp: record.createdAt,
        url: postUrl,
        score: post.likeCount,
      };
    });
  } catch (error) {
    console.error('Error fetching Bluesky feed:', error);
    return [];
  }
}
