import type { MemesData, RedditMeme } from "./meme-types";

const REDDIT_API_BASE = "https://www.reddit.com";

function formatUpvotes(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}

interface RedditPost {
  id: string;
  title: string;
  thumbnail: string;
  ups: number;
  num_comments: number;
  permalink: string;
  subreddit: string;
  created_utc: number;
  url: string;
  is_video: boolean;
  over_18: boolean;
  spoiler: boolean;
  post_hint?: string;
}

interface RedditResponse {
  data: {
    children: Array<{ data: RedditPost }>;
  };
}

export async function fetchTopMemes(limit = 10): Promise<MemesData> {
  try {
    const response = await fetch(
      `${REDDIT_API_BASE}/r/soccermemes/top.json?t=week&limit=${limit}`,
      {
        headers: {
          "User-Agent": "SoccerMonitor/1.0 (soccer-situation-monitor prototype)",
          Accept: "application/json",
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data: RedditResponse = await response.json();

    const memes: RedditMeme[] = data.data.children
      .filter((post) => {
        if (post.data.over_18) return false;
        if (post.data.spoiler) return false;
        if (post.data.is_video) return false;
        if (!post.data.url) return false;
        const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        const hasImage = imageExtensions.some((ext) =>
          post.data.url.toLowerCase().includes(ext)
        );
        const hasThumbnail =
          post.data.thumbnail &&
          post.data.thumbnail.startsWith("http") &&
          !post.data.thumbnail.includes("self") &&
          !post.data.thumbnail.includes("nsfw");
        return hasImage || hasThumbnail;
      })
      .slice(0, 5)
      .map((post) => {
        const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        const isImageUrl = imageExtensions.some((ext) =>
          post.data.url.toLowerCase().includes(ext)
        );

        return {
          id: post.data.id,
          title: post.data.title,
          thumbnail: isImageUrl ? post.data.url : post.data.url,
          upvotes: post.data.ups,
          comments: post.data.num_comments,
          permalink: post.data.permalink,
          subreddit: post.data.subreddit,
          createdAt: post.data.created_utc,
          url: post.data.url,
          isVideo: post.data.is_video,
        };
      });

    return {
      memes,
      fetchedAt: Date.now(),
      source: "reddit",
    };
  } catch (error) {
    console.error("Failed to fetch memes from Reddit:", error);
    return getSampleMemesData();
  }
}

export function getSampleMemesData(): MemesData {
  const sampleMemes: RedditMeme[] = [
    {
      id: "sample-1",
      title: "When your team signs a new striker and he scores on debut",
      thumbnail: "https://picsum.photos/seed/soccer1/150/150",
      upvotes: 45400,
      comments: 892,
      permalink: "/r/soccermemes/comments/sample1/",
      subreddit: "soccermemes",
      createdAt: Date.now() / 1000 - 86400 * 2,
      url: "https://picsum.photos/seed/soccer1/400/300",
      isVideo: false,
    },
    {
      id: "sample-2",
      title: "Ronaldo waiting for his next transfer opportunity",
      thumbnail: "https://picsum.photos/seed/soccer2/150/150",
      upvotes: 38200,
      comments: 1247,
      permalink: "/r/soccermemes/comments/sample2/",
      subreddit: "soccermemes",
      createdAt: Date.now() / 1000 - 86400 * 3,
      url: "https://picsum.photos/seed/soccer2/400/300",
      isVideo: false,
    },
    {
      id: "sample-3",
      title: "That moment when VAR takes away your goal",
      thumbnail: "https://picsum.photos/seed/soccer3/150/150",
      upvotes: 29800,
      comments: 654,
      permalink: "/r/soccermemes/comments/sample3/",
      subreddit: "soccermemes",
      createdAt: Date.now() / 1000 - 86400 * 1,
      url: "https://picsum.photos/seed/soccer3/400/300",
      isVideo: false,
    },
    {
      id: "sample-4",
      title: "Manager watching the bench during a 90th minute substitution",
      thumbnail: "https://picsum.photos/seed/soccer4/150/150",
      upvotes: 52100,
      comments: 2103,
      permalink: "/r/soccermemes/comments/sample4/",
      subreddit: "soccermemes",
      createdAt: Date.now() / 1000 - 86400 * 4,
      url: "https://picsum.photos/seed/soccer4/400/300",
      isVideo: false,
    },
    {
      id: "sample-5",
      title: "When you finally get VAR to check the penalty",
      thumbnail: "https://picsum.photos/seed/soccer5/150/150",
      upvotes: 18700,
      comments: 445,
      permalink: "/r/soccermemes/comments/sample5/",
      subreddit: "soccermemes",
      createdAt: Date.now() / 1000 - 86400 * 5,
      url: "https://picsum.photos/seed/soccer5/400/300",
      isVideo: false,
    },
  ];

  return {
    memes: sampleMemes,
    fetchedAt: Date.now(),
    source: "sample",
  };
}

export function formatUpvoteCount(count: number): string {
  return formatUpvotes(count);
}