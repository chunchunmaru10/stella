import { db } from "database";
import { procedure, router } from "../trpc";
import { statSchema } from "@/lib/schema";
import { z } from "zod";
import {
  deleteImage,
  getStatFull,
  uploadImageFromExternalURL,
} from "@/lib/server/utils";

export const statRouter = router({
  getAllSubstats: procedure.query(async () => {
    return await db.stat.findMany({
      where: {
        canBeSubstats: true,
      },
    });
  }),
  getAllStats: procedure.query(async () => {
    return await db.stat.findMany({
      include: {
        mainStatScalings: true,
        subStatScalings: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });
  }),
  editStat: procedure
    .input(
      statSchema.extend({
        originalName: z.string().min(1, "Original name is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const originalStat = await getStatFull(input.originalName);

      if (!originalStat)
        throw new Error(
          `Cannot find stat with name ${input.originalName} to edit.`,
        );

      let imageUrl = originalStat.thumbnail;
      // reupload image if either name or thumbnail url is different
      // if name different, delete the old file with that name later
      if (
        originalStat.name !== input.name ||
        originalStat.thumbnail !== input.thumbnail
      ) {
        imageUrl = await uploadImageFromExternalURL(
          input.thumbnail,
          `stats/${input.name}`,
        );
      }

      await db.stat.update({
        data: {
          name: input.name,
          thumbnail: imageUrl,
          sortOrder: input.sortOrder,
          mainStatScalings: {
            deleteMany: {
              statName: input.originalName,
            },
            createMany: input.mainStatScalings.canBeMainStat
              ? {
                  data: input.mainStatScalings.scalings,
                }
              : undefined,
          },
          subStatScalings: {
            deleteMany: {
              statName: input.originalName,
            },
            createMany: input.subStatScalings.canBeSubstat
              ? {
                  data: input.subStatScalings.scalings,
                }
              : undefined,
          },
        },
        where: {
          name: input.originalName,
        },
      });

      if (input.name !== originalStat.name)
        await deleteImage(`stats/${originalStat.name}`);
    }),
});
