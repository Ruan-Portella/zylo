import Link from "next/link";
import { CommentsGetManyOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon, MessageSquare, MoreVerticalIcon, ThumbsDownIcon, ThumbsUpIcon, Trash2Icon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CommentForm } from "./comment-form";
import { CommentReplies } from "./comment-replies";

interface CommentItemProps {
  comment: CommentsGetManyOutput['items'][number];
  variant?: "reply" | "comment";
}

export const CommentItem = ({ comment, variant = 'comment' }: CommentItemProps) => {
  const clerk = useClerk();
  const { userId } = useAuth();
  const utils = trpc.useUtils()

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isRepliesOpen, setIsRepliesOpen] = useState(false);

  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate();
      toast.success("Comentário removido com sucesso!");
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn()
        return;
      }
      toast.error("Erro ao remover comentário!");
    },
  });

  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn()
        return;
      }
      toast.error("Erro ao curtir comentário!");
    },
  });

  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn()
        return;
      }
      toast.error("Erro ao descurtir comentário!");
    },
  });

  return (
    <div>
      <div className="flex gap-4">
        <Link prefetch  href={`/users/${comment.userId}`}>
          <UserAvatar
            size={variant === 'comment' ? 'lg' : 'sm'}
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link prefetch  href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.createdAt, {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </Link>
          <p className="text-sm">
            {comment.value}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Button
                size='icon'
                variant='ghost'
                disabled={like.isPending}
                onClick={() => like.mutate({ commentId: comment.id })}
                className="size-8">
                <ThumbsUpIcon className={cn(comment.viewerReaction === 'like' && "fill-black")} />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>
              <Button
                size='icon'
                variant='ghost'
                disabled={dislike.isPending}
                onClick={() => dislike.mutate({ commentId: comment.id })}
                className="size-8">
                <ThumbsDownIcon className={cn(comment.viewerReaction === 'dislike' && "fill-black")} />
              </Button>
              <span className="text-xs text-muted-foreground">
                {comment.dislikeCount}
              </span>
            </div>
            {
              variant === 'comment' && (
                <Button
                  variant='ghost'
                  size='sm'
                  className="h-8"
                  onClick={() => setIsReplyOpen(true)}
                >
                  Responder
                </Button>
              )
            }
          </div>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className="size-8"
            >
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {
              variant === 'comment' && (
                <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                  <MessageSquare className="size-4" />
                  Responder
                </DropdownMenuItem>
              )
            }
            {
              comment.user.clerkId === userId && (
                <DropdownMenuItem onClick={() => remove.mutate({ id: comment.id })}>
                  <Trash2Icon className="size-4" />
                  Deletar
                </DropdownMenuItem>
              )
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {
        isReplyOpen && variant === 'comment' && (
          <div className="mt-4 pl-14">
            <CommentForm
              variant="reply"
              parentId={comment.id}
              onCancel={() => setIsReplyOpen(false)}
              videoId={comment.videoId}
              onSuccess={() => {
                setIsReplyOpen(false);
                setIsRepliesOpen(true);
              }}
            />
          </div>
        )
      }
      {comment.replyCount > 0 && variant === 'comment' && (
        <div className="pl-14">
          <Button
            size='sm'
            variant='tertiary'
            onClick={() => setIsRepliesOpen((prev) => !prev)}
          >
            {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {comment.replyCount} Respostas
          </Button>
        </div>
      )}
      {
        comment.replyCount > 0 && isRepliesOpen && variant === 'comment' && (
          <CommentReplies
            parentId={comment.id}
            videoId={comment.videoId}
          />
        )
      }
    </div>
  )
};