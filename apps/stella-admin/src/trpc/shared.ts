import type { AppRouter } from "@/server";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import SuperJSON from "superjson";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const transformer = SuperJSON;

export function getUrl() {
  return getBaseUrl() + "/api/trpc";
}

export type RouterInputs = inferRouterInputs<AppRouter>;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
