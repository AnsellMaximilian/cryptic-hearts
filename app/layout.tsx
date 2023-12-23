import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web5ContextProvider } from "@/contexts/Web5Context";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cryptic Hearts",
  description: "Decentralized Dating App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-[#ffffff] flex flex-col min-h-screen`}
      >
        <Web5ContextProvider>{children}</Web5ContextProvider>
        <Toaster />
      </body>
    </html>
  );
}
