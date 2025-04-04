import { SubscriptionsVideosSection } from "../sections/subscriptions-videos-section";

export const SubscriptionsView = () => {
  return (
    <div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inscrições</h1>
        <p className="text-sm text-muted-foreground">
          Videos de canais que você está inscrito.
        </p>
      </div>
      <SubscriptionsVideosSection />
    </div>
  )
};

export default SubscriptionsView;