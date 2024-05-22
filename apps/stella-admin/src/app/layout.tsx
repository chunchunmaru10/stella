export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import Navbar from "@/components/navbar";
import TRPCProvider from "../trpc/provider";
import Sidenav from "@/components/sidenav";
import { Toaster } from "@/components/ui/toaster";
import ProgressBarProvider from "@/components/progress-bar-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stella Admin",
  description: "Admin dashboard for Stella's Data Management",
  icons: ["/favicon.webp"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark scrollbar-thin scrollbar-track-transparent"
      suppressHydrationWarning
    >
      <UserProvider>
        <TRPCProvider>
          <body className={inter.className}>
            <ProgressBarProvider>
              <Navbar />
              <div className="mx-8 flex">
                <div className="hidden lg:block">
                  <Sidenav />
                </div>
                <main className="h-[calc(100svh-7rem)] max-w-full flex-grow px-4">
                  {children}
                </main>
              </div>
              <Toaster />
            </ProgressBarProvider>
          </body>
        </TRPCProvider>
      </UserProvider>
    </html>
  );
}
