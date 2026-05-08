"use client";

import type { MemesData } from "@/lib/soccer/meme-types";

type Props = {
  memesData: MemesData;
};

function formatUpvotes(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`;
  }
  return count.toString();
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function MemesSection({ memesData }: Props) {
  const { memes, source } = memesData;

  if (memes.length === 0) {
    return (
      <div className="flex flex-col gap-2 rounded border border-[#30363d] bg-[#161b22] p-3">
        <div className="flex items-center gap-2 border-b border-[#30363d] pb-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[#ff4500] text-[10px] font-bold text-white">
            R
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">r/soccermemes</h2>
        </div>
        <div className="flex items-center justify-center py-4 text-xs text-[#6e7681]">
          No memes available
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-[#30363d] bg-[#161b22] p-3">
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-[#ff4500] text-[10px] font-bold text-white">
          R
        </div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">r/soccermemes Top Week</h2>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-[#6e7681]">
          {source === "reddit" ? (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-[#2ea67f]" />
              <span>Live</span>
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-[#d29922]" />
              <span>Sample</span>
            </>
          )}
        </span>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        {memes.map((meme, index) => (
          <a
            key={meme.id}
            href={`https://reddit.com${meme.permalink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 rounded bg-[#0d1117] p-2 transition-colors hover:bg-[#21262d]"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-[#21262d]">
              {meme.thumbnail ? (
                <img
                  src={meme.thumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.parentElement!.innerHTML = `<span class="text-[10px] text-[#6e7681]">${index + 1}</span>`;
                  }}
                />
              ) : (
                <span className="text-[12px] font-bold text-[#6e7681]">{index + 1}</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[11px] font-medium text-[#e6edf3] leading-tight line-clamp-2 group-hover:text-[#58a6ff]">
                {meme.title}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-[#6e7681]">
                <span className="flex items-center gap-0.5">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4L4 20h16L12 4z" />
                  </svg>
                  {formatUpvotes(meme.upvotes)}
                </span>
                <span>{timeAgo(meme.createdAt)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}