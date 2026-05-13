"use client";

import { useCallback, useEffect, useState } from "react";

import type { Shoutout } from "@/types/shoutout.types";
import ShoutoutCard from "@/components/shared/shoutout-card";

interface ShoutoutsResponse {
  shoutouts: Shoutout[];
  total: number;
  hasMore: boolean;
}

export default function ShoutoutsSection() {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchShoutouts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shoutouts?page=${pageNum}`);
      if (!res.ok) throw new Error("Failed to fetch shoutouts");

      const data: ShoutoutsResponse = await res.json();

      setShoutouts((prev) =>
        pageNum === 1 ? data.shoutouts : [...prev, ...data.shoutouts]
      );
      setHasMore(data.hasMore);
    } catch {
      // Silently handle — the empty state will show if nothing loaded
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Fetch initial page on mount
  useEffect(() => {
    fetchShoutouts(1);
  }, [fetchShoutouts]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchShoutouts(nextPage);
  }

  return (
    <section
      id="shoutouts"
      className="bg-parchment px-4 py-24 sm:px-8 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <h2 className="text-center font-display text-section font-bold text-crimson">
          Shoutouts from the Heart
        </h2>
        <p className="mt-3 text-center font-script text-lead text-ink">
          Everyone who loves you, sending their love
        </p>

        {/* Loading state for initial load */}
        {initialLoad && (
          <div className="mt-12 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-crimson/20 border-t-crimson" />
          </div>
        )}

        {/* Empty state */}
        {!initialLoad && shoutouts.length === 0 && (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <span className="animate-bounce text-6xl" role="img" aria-label="envelope">
              💌
            </span>
            <p className="mt-4 font-display text-lg font-semibold text-crimson">
              Be the first to leave a shoutout!
            </p>
            <p className="mt-1 font-body text-meta text-cream-muted">
              Share some love — it&apos;ll show up right here.
            </p>
          </div>
        )}

        {/* Shoutouts grid */}
        {shoutouts.length > 0 && (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shoutouts.map((shoutout) => (
              <ShoutoutCard key={shoutout.id} shoutout={shoutout} />
            ))}
          </div>
        )}

        {/* Load more button */}
        {hasMore && shoutouts.length > 0 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="rounded-romantic border-2 border-crimson bg-transparent px-8 py-3 font-display text-base font-semibold text-crimson transition-all duration-300 hover:bg-crimson hover:text-cream-text disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-crimson/20 border-t-crimson" />
                  Loading…
                </span>
              ) : (
                "Load more shoutouts"
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
