import { AppRouter } from "@/server";
import {
  createTRPCClient,
  httpBatchLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { getUrl, transformer } from "./shared";
import { headers } from "next/headers";

export const api = createTRPCClient<AppRouter>({
  links: [
    unstable_httpBatchStreamLink({
      url: getUrl(),
      headers() {
        const heads = new Map(headers());
        heads.set("x-trpc-source", "rsc");
        return Object.fromEntries(heads);
      },
      transformer,
    }),
  ],
});
