import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  prompt: z.string().min(10)
});

export const ThumbnailGenerateModal = ({ videoId, open, onOpenChange }: ThumbnailGenerateModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
    onSuccess: () => {
      toast.success('Thumbnail sendo gerada', { description: 'Isso pode levar alguns minutos' });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Erro ao gerar thumbnail');
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onOpenChange(false);
    generateThumbnail.mutate({
      id: videoId,
      prompt: values.prompt
    });
  }

  return (
    <ResponsiveModal
      title="Upload Thumbnail"
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
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor={field.name}>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Um prompt para a geração de thumbnails"
                    className="resize-none"
                    cols={30}
                    rows={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={generateThumbnail.isPending}>
              Gerar Thumbnail
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  )
};