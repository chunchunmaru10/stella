import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

const t = initTRPC.create({
  transformer: superjson,
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
  jsonl: {
    pingMs: 1000,
  },
  sse: {
    maxDurationMs: 3600_000,
    ping: {
      enabled: true,
      intervalMs: 15_000,
    },
    client: {
      reconnectAfterInactivityMs: 1_000,
    },
  },
});

export const router = t.router;
export const procedure = t.procedure;
