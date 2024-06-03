import { z } from "zod";
import { procedure, router } from "../trpc";
import { db } from "database";

export const rarityRouter = router({
  getRarities: procedure.query(async () => await db.rarity.findMany()),
  changeRarityMaxLevel: procedure
    .input(
      z
        .array(
          z.object({
            rarity: z
              .number()
              .min(1, "Invalid rarity number")
              .int("Rarity must be an integer"),
            maxLevel: z
              .number()
              .positive("Must be a positive value")
              .int("Max level must be an integer"),
          }),
        )
        .min(1, "At least 1 rarity is required"),
    )
    .mutation(async ({ input }) => {
      await db.$transaction(async (transaction) => {
        for (const rarity of input) {
          // check if exists
          const existing = await transaction.rarity.findFirst({
            where: {
              rarity: rarity.rarity,
            },
          });

          if (!existing)
            throw new Error(`Could not find ${rarity} star rarity`);

          await transaction.rarity.update({
            data: {
              maxLevel: rarity.maxLevel,
            },
            where: {
              rarity: rarity.rarity,
            },
          });
        }
      });
    }),
});
