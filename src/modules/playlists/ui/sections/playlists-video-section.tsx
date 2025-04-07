"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { PlaylistGridCard, PlaylistGridCardSkeleton } from "../components/playlist-grid-card";

export const PlaylistsVideosSection = () => {
  return (
    <Suspense fallback={<PlaylistsVideosSkeleton />}>
      <ErrorBoundary fallback={<p>Error....</p>}>
        <PlaylistsVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
};

const PlaylistsVideosSkeleton = () => {
  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
      {
        Array.from({ length: 18 }).map((_, index) => (
          <PlaylistGridCardSkeleton
            key={index}
          />
        ))
      }
    </div>
  )
}

const PlaylistsVideosSectionSuspense = () => {
  const [playlists, query] = trpc.playlists.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });


  return (
    <div>
      <div className="gap-y-10 gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {
          playlists.pages.flatMap((page) => page.items).map((playlist) => (
            <PlaylistGridCard
              key={playlist.id}
              data={playlist}
            />
          ))
        }
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
};