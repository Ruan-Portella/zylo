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
                      {video.title}
                    </TableCell>
                    <TableCell>
                      visibilidade
                    </TableCell>
                    <TableCell>
                      status
                    </TableCell>
                    <TableCell>
                      data
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