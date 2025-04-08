'use client';

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

interface PlaylistHeaderSectionProps {
  playlistId: string;
}

export const PlaylistHeaderSection = ({ playlistId }: PlaylistHeaderSectionProps) => {
  return (
   <Suspense fallback={<PlaylistHeaderSectionContentSkeleton />}>
    <ErrorBoundary fallback={<div>Erro ao carregar o cabeçalho da playlist</div>}>
      <PlaylistHeaderSectionContent playlistId={playlistId} />
    </ErrorBoundary>
   </Suspense>
  )
};

const PlaylistHeaderSectionContentSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
};

const PlaylistHeaderSectionContent = ({ playlistId }: PlaylistHeaderSectionProps) => {
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({ id: playlistId });

  const router = useRouter();
  const utils = trpc.useUtils();

  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist removida com sucesso!");
      utils.playlists.getMany.invalidate();
      router.push("/playlists");
    },
    onError: () => {
      toast.error("Erro ao remover a playlist.");
    },
  });
  
  return (
    <div className="flex justify-between items-center">
        <div>
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <p className="text-sm text-muted-foreground">
          Videos da sua playlist.
        </p>
      </div>
      <Button
        variant='outline'
        size='icon'
        className="rounded-full"
        onClick={() => remove.mutate({id: playlistId })}
        disabled={remove.isPending}
      >
        <Trash2Icon />
      </Button>
    </div>
  )
};