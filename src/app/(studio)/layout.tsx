import { StudioLayout } from "@/modules/studio/ui/layouts/studio-layout";

export const dynamic = "force-dynamic";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StudioLayout>
      {children}
    </StudioLayout>
  );
}
