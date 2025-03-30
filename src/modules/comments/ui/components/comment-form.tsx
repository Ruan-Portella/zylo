import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { commentInsertSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import { useClerk, useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  parentId?: string;
  variant?: "reply" | "comment";
}

const commentInsertSchemaOmit = commentInsertSchema.omit({ userId: true });

export const CommentForm = ({ videoId, onSuccess, onCancel, parentId, variant = 'comment' }: CommentFormProps) => {
  const { user } = useUser();
  const clerk = useClerk()

  const utils = trpc.useUtils();
  const create = trpc.comments.create.useMutation({
    onSuccess: async () => {
      utils.comments.getMany.invalidate({ videoId });
      utils.comments.getMany.invalidate({ videoId, parentId });
      form.reset();
      toast.success("Comentário adicionado com sucesso!");
      onSuccess?.();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
      toast.error("Erro ao adicionar comentário, tente novamente mais tarde.");
    },
  })

  const form = useForm<z.infer<typeof commentInsertSchemaOmit>>({
    resolver: zodResolver(commentInsertSchemaOmit),
    defaultValues: {
      parentId,
      videoId,
      value: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof commentInsertSchemaOmit>) => {
    create.mutate(values)
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-4 group">
        <UserAvatar
          size='lg'
          imageUrl={user?.imageUrl || "/user-placeholder.svg"}
          name={user?.fullName || "Usuário"}
        />
        <div className="flex-1">
          <div>
            <FormField
              name="value"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={
                        variant === 'reply' ? "Responda ao comentário..." : "Deixe seu comentário..."
                      }
                      className="resize-none bg-transparent overflow-hidden min-h-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="justify-end gap-2 mt-2 flex">
            {
              onCancel && (
                <Button
                  variant="ghost"
                  size='sm'
                  type="button"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              )
            }
            <Button disabled={create.isPending} type="submit" size='sm'>
              {
                variant === 'reply' ? "Responder" : "Comentar"
              }
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
};