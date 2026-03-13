"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SimplePool } from "nostr-tools/pool";
import { decode } from "nostr-tools/nip19";
import type { Event } from "nostr-tools/core";

const NPUB = "npub1kvaln6tm0re4d99q9e4ma788wpvnw0jzkz595cljtfgwhldd75xsj9tkzv";
const RELAYS = ["wss://relay.damus.io", "wss://relay.primal.net"];
const MAX_POSTS = 5;
const IMAGE_RE = /https?:\/\/\S+\.(?:jpe?g|png|gif|webp)(?:[?#]\S*)?/gi;

const decoded = decode(NPUB);
const HEX_PUBKEY = decoded.data as string;

interface NostrPost {
  id: string;
  content: string;
  created_at: number;
  images: string[];
}

function extractImages(content: string): string[] {
  return Array.from(content.matchAll(new RegExp(IMAGE_RE.source, "gi")), (m) => m[0]);
}

function stripImageUrls(content: string): string {
  return content
    .replace(new RegExp(IMAGE_RE.source, "gi"), "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function eventToPost(event: Event): NostrPost | null {
  if (event.tags.some((t) => t[0] === "e")) return null;
  const images = extractImages(event.content);
  if (images.length === 0) return null;
  return { id: event.id, content: event.content, created_at: event.created_at, images };
}

export default function NostrSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [posts, setPosts] = useState<NostrPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const pool = new SimplePool();
      const events = await pool.querySync(
        RELAYS,
        { kinds: [1], authors: [HEX_PUBKEY], limit: 20 },
        { maxWait: 8000 }
      );
      pool.close(RELAYS);

      const filtered = events
        .map(eventToPost)
        .filter((p): p is NostrPost => p !== null)
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, MAX_POSTS);

      setPosts(filtered);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadPosts();
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadPosts]);

  return (
    <section id="nostr" ref={sectionRef} className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 xl:px-8">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <h2 className="mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl">
            Minibits on Nostr
          </h2>
          <p className="text-lg leading-relaxed text-zinc-600">
            Follow our latest updates on the decentralized Nostr social network.
          </p>
          <a
            href={`https://njump.me/${NPUB}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#3680FA] hover:underline"
          >
            View full profile
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-zinc-100 bg-zinc-50 overflow-hidden">
                <div className="h-56 bg-zinc-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-zinc-200 rounded w-1/4" />
                  <div className="h-3 bg-zinc-200 rounded w-full" />
                  <div className="h-3 bg-zinc-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {loaded && posts.length === 0 && (
          <p className="text-zinc-500">No posts found.</p>
        )}

        {/* Posts grid */}
        {posts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => {
              const text = stripImageUrls(post.content);
              const postUrl = `https://njump.me/${post.id}`;
              return (
                <a
                  key={post.id}
                  href={postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden transition-shadow hover:shadow-md"
                >
                  {/* Image */}
                  <div className="h-56 w-full overflow-hidden bg-zinc-200">
                    <img
                      src={post.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-xs text-zinc-400 mb-2">{formatDate(post.created_at)}</p>
                    {text && (
                      <p className="text-sm leading-relaxed text-zinc-700 line-clamp-4">{text}</p>
                    )}
                    <span className="mt-auto pt-4 inline-flex items-center gap-1 text-xs font-medium text-[#3680FA] group-hover:underline">
                      View on Nostr
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
