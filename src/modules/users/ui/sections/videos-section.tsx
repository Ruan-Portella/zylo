"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface VieosSectionProps {
  userId?: string;
};

export const VideosSection = ({ userId }: VieosSectionProps) => {
  return (
    <Suspense key={userId} fallback={<VideosSkeleton />}>
      <ErrorBoundary fallback={<p>Error....</p>}>
        <VideosSectionSuspense userId={userId} />
      </ErrorBoundary>
    </Suspense>
  )
};

const VideosSkeleton = () => {
  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-4 [@media(min-width:2200px)]:grid-cols-4">
      {
        Array.from({ length: 18 }).map((_, index) => (
          <VideoGridCardSkeleton
            key={index}
          />
        ))
      }
    </div>
  )
}

const VideosSectionSuspense = ({ userId }: VieosSectionProps) => {
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT,
    userId,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });


  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-4 [@media(min-width:2200px)]:grid-cols-4">
        {
          videos.pages.flatMap((page) => page.items).map((video) => (
            <VideoGridCard
              key={video.id}
              data={video}
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