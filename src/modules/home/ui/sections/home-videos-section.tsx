"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";

interface HomeVieosSectionProps {
  categoryId?: string;
};

export const HomeVideosSection = ({ categoryId }: HomeVieosSectionProps) => {
  return (
    <Suspense key={categoryId} fallback={<HomeVideosSkeleton />}>
      <ErrorBoundary fallback={<p>Error....</p>}>
        <HomeVideosSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  )
};

const HomeVideosSkeleton = () => {
  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
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

const HomeVideosSectionSuspense = ({ categoryId }: HomeVieosSectionProps) => {
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT,
    categoryId,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });


  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
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