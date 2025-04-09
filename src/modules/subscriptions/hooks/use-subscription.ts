import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface useSubscriptionProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
};

export const useSubscription = ({ userId, isSubscribed, fromVideoId }: useSubscriptionProps) => {
  const clerk = useClerk();

  const utils = trpc.useUtils();

  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Inscrito com sucesso!");

      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({ id: userId });

      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId });
      }
    },
    onError: (error) => {
      toast.error("Erro ao se inscrever. Tente novamente mais tarde.");

      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Você precisa estar logado para se inscrever.");
        clerk.openSignIn();
      };
    }
  });

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Desinscrito com sucesso!");

      utils.users.getOne.invalidate({ id: userId });
      utils.videos.getManySubscribed.invalidate();

      if (fromVideoId) {
        utils.videos.getOne.invalidate({ id: fromVideoId });
      }
    },
    onError: (error) => {
      toast.error("Erro ao se desinscrever. Tente novamente mais tarde.");

      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Você precisa estar logado para se desinscrever.");
        clerk.openSignIn();
      };
    }
  });

  const isPending = subscribe.isPending || unsubscribe.isPending;

  const onClick = () => {
    if (isSubscribed) {
      unsubscribe.mutate({
        userId,
      })
    } else {
      subscribe.mutate({
        userId,
      })
    }
  }

  return {
    isPending,
    onClick,
  }
}