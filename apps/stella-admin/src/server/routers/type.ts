import { db } from "database";
import { procedure, router } from "../trpc";

export const typeRouter = router({
  getAllTypesExcludingFixed: procedure.query(async () => {
    return (
      await db.type.findMany({
        include: {
          stats: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      })
    ).filter((type) => type.stats.length > 1);
  }),
  getAllTypes: procedure.query(async () => {
    return await db.type.findMany({
      orderBy: {
        sortOrder: "asc",
      },
    });
  }),
});
