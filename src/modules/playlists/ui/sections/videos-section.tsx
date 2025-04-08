"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { toast } from "sonner";

interface VideosSectionProps {
  playlistId: string;
}

export const VideosSection = ({ playlistId }: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSkeleton />}>
      <ErrorBoundary fallback={<p>Error....</p>}>
        <VideosSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  )
};

const VideosSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {
          Array.from({ length: 18 }).map((_, index) => (
            <VideoGridCardSkeleton
              key={index}
            />
          ))
        }
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {
          Array.from({ length: 18 }).map((_, index) => (
            <VideoRowCardSkeleton
              size={'compact'}
              key={index}
            />
          ))
        }
      </div>
    </div>

  )
}

const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
  const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT,
    playlistId
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  const utils = trpc.useUtils();

  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Vídeo removido da playlist com sucesso!")
      utils.playlists.getMany.invalidate()
      utils.playlists.getManyForVideo.invalidate({
        videoId: data.videoId,
      })
      utils.playlists.getOne.invalidate({
        id: data.playlistId,
      })
      utils.playlists.getVideos.invalidate({
        playlistId: data.playlistId,
      })
    },
    onError: () => {
      toast.error("Erro ao remover vídeo na playlist.")
    },
  })

  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {
          videos.pages.flatMap((page) => page.items).map((video) => (
            <VideoGridCard
              key={video.id}
              data={video}
              onRemove={() => removeVideo.mutate({
                videoId: video.id,
                playlistId: playlistId,
              })
              }
            />
          ))
        }
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {
          videos.pages.flatMap((page) => page.items).map((video) => (
            <VideoRowCard
              key={video.id}
              data={video}
              onRemove={() => removeVideo.mutate({
                videoId: video.id,
                playlistId: playlistId,
              })
              }
              size='compact'
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