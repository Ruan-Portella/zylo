import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from '@clerk/localizations'
import "./globals.css";
import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Zylo",
  description: "Zylo é uma plataforma de entreterimento digital",
  icons: {
    icon: [
      {
        url: '/images/favicon.ico',
      }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl='/' localization={ptBR}>
      <html lang="en">
        <body
          className={`${outfit.className} antialiased`}
        >
          <TRPCProvider>
            <Toaster />
            {children}
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
