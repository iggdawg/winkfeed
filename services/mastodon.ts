import { FeedTile } from '../models/Tile';
import { useAuthStore } from '../store/useAuthStore';

// Simple helper to strip HTML tags from Mastodon content
const stripHtml = (html: string) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
};

export async function fetchMastodonFeed(): Promise<FeedTile[]> {
  const { mastodonInstance, mastodonToken } = useAuthStore.getState();

  if (!mastodonInstance || !mastodonToken) {
    return [];
  }

  try {
    // Ensure instance URL is properly formatted
    const baseUrl = mastodonInstance.startsWith('http') ? mastodonInstance : `https://${mastodonInstance}`;
    const endpoint = `${baseUrl}/api/v1/timelines/home?limit=25`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${mastodonToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Mastodon API error: ${response.status}`);
    }

    const data = await response.json();

    return data.map((status: any): FeedTile => {
      const imageAttachment = status.media_attachments?.find((m: any) => m.type === 'image');
      const imageUrl = imageAttachment ? (imageAttachment.preview_url || imageAttachment.url) : undefined;

      const videoAttachment = status.media_attachments?.find((m: any) => m.type === 'video' || m.type === 'gifv');
      const videoUrl = videoAttachment ? videoAttachment.url : undefined;

      const account = status.account;
      
      // Determine the url to open. If it's a reblog, use the reblog URL, otherwise the status URL.
      const targetStatus = status.reblog || status;

      return {
        id: `mastodon_${status.id}`,
        source: 'mastodon',
        title: stripHtml(targetStatus.content),
        imageUrl: imageUrl || (videoAttachment ? videoAttachment.preview_url : undefined),
        videoUrl,
        author: `@${account.username}`, // could use account.acct to show instance
        authorAvatarUrl: account.avatar,
        timestamp: targetStatus.created_at,
        url: targetStatus.url,
        score: targetStatus.favourites_count,
      };
    });
  } catch (error) {
    console.error('Error fetching Mastodon feed:', error);
    return [];
  }
}
