import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface PlaylistCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  name: z.string().min(1)
});

export const PlaylistCreateModal = ({ open, onOpenChange }: PlaylistCreateModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ""
    }
  });
  const utils = trpc.useUtils()

  const create = trpc.playlists.create.useMutation({
    onSuccess: () => {
      toast.success('Playlist criada');
      utils.playlists.getMany.invalidate();
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Erro ao criar playlist');
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onOpenChange(false);
    create.mutate({
      name: values.name
    });
  }

  return (
    <ResponsiveModal
      title="Criar Playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Digite o nome da playlist"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={create.isPending}>
              Criar
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  )
};