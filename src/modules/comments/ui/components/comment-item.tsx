import Link from "next/link";
import { CommentsGetManyOutput } from "../../types";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageSquare, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";

interface CommentItemProps {
  comment: CommentsGetManyOutput['items'][number];
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const clerk = useClerk();
  const { userId } = useAuth();
  const utils = trpc.useUtils()

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

  return (
    <div>
      <div className="flex gap-4">
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size='lg'
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/users/${comment.userId}`}>
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
            <DropdownMenuItem onClick={() => { }}>
              <MessageSquare className="size-4" />
              Responder
            </DropdownMenuItem>
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
    </div>
  )
};