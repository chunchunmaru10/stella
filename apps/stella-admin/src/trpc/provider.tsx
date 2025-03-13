"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { unstable_httpBatchStreamLink } from "@trpc/client";
import { useState } from "react";
import { api } from "./client";
import { getUrl, transformer } from "./shared";

export default function TRPCProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        logger: {
          error: () => {},
          log: () => {},
          warn: () => {},
        },
      }),
  );
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        unstable_httpBatchStreamLink({
          url: getUrl(),
        }),
      ],
      transformer,
    }),
  );
  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
