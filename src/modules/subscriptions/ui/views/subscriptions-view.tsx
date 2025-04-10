import { SubscriptionsVideosSection } from "../sections/subscriptions-video-section";

export const SubscriptionsView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Todas as Inscrições</h1>
        <p className="text-sm text-muted-foreground">
          Veja os vídeos mais recentes dos canais que você está inscrito.
        </p>
      </div>
      <SubscriptionsVideosSection />
    </div>
  )
};

export default SubscriptionsView;