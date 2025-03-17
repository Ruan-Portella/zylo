"use client";

import { toast } from "sonner";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { StudioUploader } from "./studio-uploader";
import { useRouter } from "next/navigation";

export const StudioUploadModal = () => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success("Video criado com sucesso");
      utils.studio.getMany.invalidate();
    },
    onError: () => {
      toast.error("Erro ao criar video");
    }
  });
  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success('Vídeo deletado com sucesso');
      router.push('/studio');
    },
    onError: () => {
      toast.error('Erro ao deletar o vídeo');
    }
  });

  const onSuccess = () => {
    if (!create.data?.video.id) return

    create.reset();
    router.push(`/studio/videos/${create.data.video.id}`);
  }

  return (
    <>
      <ResponsiveModal title="Upload de vídeo" open={!!create.data?.url} onOpenChange={() => {
        if (create.data?.url) {
          remove.mutate({ id: create.data.video.id });
        }
        create.reset()
      }}>
        {
          create.data?.url && <StudioUploader endpoint={create.data.url} onSuccess={onSuccess} />
        }
      </ResponsiveModal>
      <Button variant='secondary' onClick={() => create.mutate()} disabled={create.isPending}>
        {
          create.isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />
        }
        Criar
      </Button>
    </>
  )
};