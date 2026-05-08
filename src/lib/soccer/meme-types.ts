export type RedditMeme = {
  id: string;
  title: string;
  thumbnail: string | null;
  upvotes: number;
  comments: number;
  permalink: string;
  subreddit: string;
  createdAt: number;
  url: string;
  isVideo: boolean;
};

export type MemesData = {
  memes: RedditMeme[];
  fetchedAt: number;
  source: "reddit" | "sample";
};