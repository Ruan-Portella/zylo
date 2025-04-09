import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/utils";
import { trpc } from "@/trpc/client";

interface BannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const BannerUploadModal = ({ userId, open, onOpenChange }: BannerUploadModalProps) => {
  const utils = trpc.useUtils();

  const onUploadComplete = () => {
    onOpenChange(false);
    utils.users.getOne.invalidate({ id: userId });
  }

  return (
    <ResponsiveModal
      title="Upload Banner"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        content={{
          label: "Arraste e solte a imagem aqui",
          allowedContent({ ready, isUploading }) {
            if (!ready) return "Carregando...";
            if (isUploading) return "Parece que algo está carregando";
            return `Imagem (4MB)`;
          },
          button({ ready, isUploading, uploadProgress, files }) {
            if (!ready) return <div>Carregando...</div>;
            if (isUploading) return <div>Carregando {uploadProgress}%</div>;
            if (files.length > 0) return `Enviar Imagem (${files.length})`;
            return "Selecione a imagem";
          },
        }}
        endpoint='bannerUploader'
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  )
};