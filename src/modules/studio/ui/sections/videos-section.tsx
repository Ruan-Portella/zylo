"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import Link from "next/link";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";
import { translateMuxStatus } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Globe2Icon, LockIcon } from "lucide-react";

export const VideosSection = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ErrorBoundary fallback={<div>Algo deu errado!</div>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
};

const VideosSectionSuspense = () => {
  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <div>
      <div className="border-y">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 w-[510px]">Vídeo</TableHead>
              <TableHead>Visibilidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Visualizações</TableHead>
              <TableHead className="text-right">Comentários</TableHead>
              <TableHead className="text-right pr-6">Gostei</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              videos.pages.flatMap((page) => page.items).map((video) => (
                <Link href={`/studio/videos/${video.id}`} key={video.id} legacyBehavior>
                  <TableRow className="cursor-pointer">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-4">
                        <div className="relative aspect-video w-36 shrink-0">
                          <VideoThumbnail
                            imageUrl={video.thumbnailUrl!}
                            previewUrl={video.previewUrl!}
                            title={video.title}
                            duration={video.duration || 0}
                          />
                        </div>
                        <div className="flex flex-col overflow-hidden gap-y-1">
                          <span className="text-sm line-clamp-1">{video.title}</span>
                          <span className="text-sm text-muted-foreground line-clamp-1">{video.description || 'Sem descrição'}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {
                        video.visibility === 'private' ? (
                          <div>
                            <LockIcon className="size-4" />
                            <span className="text-sm">Privado</span>
                          </div>
                        ) : (
                          <div>
                            <Globe2Icon className="size-4" />
                            <span className="text-sm">Publicado</span>
                          </div>
                        )
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {
                          translateMuxStatus(video.muxStatus || 'error')
                        }
                      </div>
                    </TableCell>
                    <TableCell className="text-sm truncate">
                      {
                        format(new Date(video.createdAt), 'd MMMM yyyy', {
                          locale: ptBR
                        })
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      visualizações
                    </TableCell>
                    <TableCell className="text-right">
                      comentários
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      gostei
                    </TableCell>
                  </TableRow>
                </Link>
              ))
            }
          </TableBody>
        </Table>
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
}