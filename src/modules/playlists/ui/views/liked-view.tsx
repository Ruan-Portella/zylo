import { LikedVideosSection } from "../sections/liked-video-section";

export const LikedView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Videos com &quot;Gostei&quot;</h1>
        <p className="text-sm text-muted-foreground">
          Videos que você gostou de assistir.
        </p>
      </div>
      <LikedVideosSection />
    </div>
  )
};

export default LikedView;