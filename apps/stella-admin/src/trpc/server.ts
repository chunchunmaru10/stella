import { AppRouter } from "@/server";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { getUrl, transformer } from "./shared";
import { headers } from "next/headers";

export const api = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    httpBatchLink({
      url: getUrl(),
      headers() {
        const heads = new Map(headers());
        heads.set("x-trpc-source", "rsc");
        return Object.fromEntries(heads);
      },
    }),
  ],
});
