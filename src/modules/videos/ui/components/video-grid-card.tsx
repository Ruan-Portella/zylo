import Link from 'next/link';
import { VideoGetManyOutput } from '../../types'
import { VideoThumbnail, VideoThumbnailSkeleton } from './video-thumbnail';
import { VideoInfo, VideoInfoSkeleton } from './video-info';

interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number];
  onRemove?: () => void;
}

export const VideoGridCardSkeleton = () => {
  return (
    <div className='flex flex-col gap-2 w-full'>
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  )
};

export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className='flex flex-col gap-2 w-full group'>
      <Link prefetch  href={`/videos/${data.id}`} className='relative flex-none w-full aspect-video rounded-lg overflow-hidden'>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl!}
          previewUrl={data.thumbnailUrl!}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      <VideoInfo
        data={data}
        onRemove={onRemove}
      />
    </div>
  )
};