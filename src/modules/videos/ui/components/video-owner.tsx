import Link from "next/link";
import { VideoGetOneOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription";

interface VideoOwnerProps {
  user: VideoGetOneOutput['user'];
  videoId: string;
};

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
  const { userId: clerkUserId } = useAuth();
  const {onClick, isPending} = useSubscription({
    userId: user.id,
    isSubscribed: user.viewerSubscribed,
    fromVideoId: videoId,
  });

  return (
    <div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
      <Link prefetch  href={`/users/${user.id}`}>
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            imageUrl={user.imageUrl}
            name={user.name}
            size="lg"
          />
          <div className="flex flex-col gap-1 min-w-0">
            <UserInfo name={user.name} size='lg' />
            <span className="text-sm text-muted-foreground line-clamp-1">
              {user.subscriberCount} inscritos
            </span>
          </div>
        </div>
      </Link>
      {
        clerkUserId === user.clerkId ? (
          <Button variant='secondary' asChild className="rounded-full">
            <Link prefetch  href={`/studio/videos/${videoId}`}>
              Editar vídeo
            </Link>
          </Button>
        ) : (
          <SubscriptionButton
            onClick={onClick}
            disabled={isPending}
            isSubscribed={user.viewerSubscribed}
            className="flex-none"
          />
        )
      }
    </div>
  )
};