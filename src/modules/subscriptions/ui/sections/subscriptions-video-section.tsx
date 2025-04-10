"use client";

import { trpc } from "@/trpc/client";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { toast } from "sonner";
import Link from "next/link";
import { SubscriptionItem, SubscriptionItemSkeleton } from "../components/subscription-item";

export const SubscriptionsVideosSection = () => {
  return (
    <Suspense fallback={<SubscriptionsVideosSkeleton />}>
      <ErrorBoundary fallback={<p>Error....</p>}>
        <SubscriptionsVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
};

const SubscriptionsVideosSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-4">
        {
          Array.from({ length: 18 }).map((_, index) => (
            <SubscriptionItemSkeleton
              key={index}
            />
          ))
        }
      </div>
    </div>

  )
}

const SubscriptionsVideosSectionSuspense = () => {
  const utils = trpc.useUtils();

  const [subscriptions, query] = trpc.subscriptions.getMany.useSuspenseInfiniteQuery({
    limit: DEFAULT_LIMIT,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  });

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: (data) => {
      toast.success("Desinscrito com sucesso!");

      utils.users.getOne.invalidate({ id: data.creatorId });
      utils.videos.getManySubscribed.invalidate();
      utils.subscriptions.getMany.invalidate();
    },
    onError: () => {
      toast.error("Erro ao se desinscrever. Tente novamente mais tarde.");
    }
  });


  return (
    <div>
      <div className="flex flex-col gap-4">
        {
          subscriptions.pages.flatMap((page) => page.items).map((subscription) => (
            <Link key={subscription.creatorId} href={`/users/${subscription.creatorId}}`}>
              <SubscriptionItem
                key={subscription.creatorId}
                name={subscription.user.name}
                imageUrl={subscription.user.imageUrl}
                subscriberCount={subscription.user.subscriberCount}
                onUnsubscribe={() => unsubscribe.mutate({ userId: subscription.creatorId })}
                disabled={unsubscribe.isPending}
              />
            </Link>
          ))
        }
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
};