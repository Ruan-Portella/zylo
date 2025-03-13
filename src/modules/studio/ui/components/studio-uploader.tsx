import { Button } from '@/components/ui/button';
import MuxUploader, {
  MuxUploaderDrop,
  MuxUploaderFileSelect,
  MuxUploaderProgress,
} from '@mux/mux-uploader-react'
import { UploadIcon } from 'lucide-react';

interface StudioUploaderProps {
  endpoint?: string | null;
  onSuccess?: () => void;
};

const UPLOADER_ID = 'video-uploader'

export const StudioUploader = ({ endpoint, onSuccess }: StudioUploaderProps) => {
  return (
    <div>
      <MuxUploader
        onSuccess={onSuccess}
        lang='pt-BR'
        id={UPLOADER_ID}
        className='hidden group/uploader'
        endpoint={endpoint} />
      <MuxUploaderDrop muxUploader={UPLOADER_ID} className='group/drop'>
        <div slot='heading' className='flex flex-col items-center gap-6'>
          <div className='flex items-center justify-center gap-2 rounded-full bg-muted h-32 w-32'>
            <UploadIcon className='size-10 text-muted-foreground group/drop-[&[active]]:animate-bounce transition-all duration-300' />
          </div>
          <div className='flex flex-col gap-2 text-center'>
            <p className='text-sm'>
              Arraste e solte um arquivo de vídeo para fazer upload.
            </p>
            <p className='text-sm text-muted-foreground'>
              Seus vídeos serão privados até que você decida publicá-los.
            </p>
            <MuxUploaderFileSelect muxUploader={UPLOADER_ID}>
              <Button type='button' className='w-full'>
                Selecione um arquivo
              </Button>
            </MuxUploaderFileSelect>
          </div>
        </div>
        <span slot='separator' className='hidden' />
        <MuxUploaderProgress muxUploader={UPLOADER_ID} className='text-sm' type='percentage' />
        <MuxUploaderProgress muxUploader={UPLOADER_ID} type='bar' />
      </MuxUploaderDrop>
    </div>
  )
}