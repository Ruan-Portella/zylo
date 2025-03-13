"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { StudioUploader } from "./studio-uploader";

export const StudioUploadModal = () => {
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

  return (
    <>
      <ResponsiveModal title="Upload de vídeo" open={!!create.data?.url} onOpenChange={() => create.reset()}>
        {
          create.data?.url && <StudioUploader endpoint={create.data.url} onSuccess={() => {
            create.reset();
          }} />
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