import db from "../db";
import { procedure, router } from "../trpc";

export const statRouter = router({
  getAllSubstats: procedure.query(async () => {
    return await db.stat.findMany({
      where: {
        canBeSubstats: true,
      },
    });
  }),
});
