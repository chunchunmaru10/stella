import { characterSchema } from "@/lib/schema";
import { db } from "database";
import { procedure, router } from "../trpc";
import { z } from "zod";
import {
  deleteImage,
  getCharacterFull,
  uploadImageFromExternalURL,
} from "@/lib/server/utils";

export const characterRouter = router({
  getAllCharacters: procedure.query(async () => {
    return await db.character.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),
  addCharacter: procedure.input(characterSchema).mutation(async ({ input }) => {
    const existing = await db.character.findFirst({
      where: {
        name: input.name,
      },
    });

    if (existing)
      throw new Error("Another character with this name already exists");

    const imageUrl = await uploadImageFromExternalURL(
      input.thumbnail,
      `characters/${input.name}`,
    );

    await db.character.create({
      data: {
        name: input.name,
        thumbnail: imageUrl,
        rarity: input.rarity,
        releaseDate: input.releaseDate,
        sets: {
          connect: input.sets.map((set) => ({
            name: set,
          })),
        },
        characterMainStats: {
          createMany: {
            data: input.mainStats.map(({ stat, type }) => ({
              statName: stat,
              typeName: type,
            })),
          },
        },
        characterSubstats: {
          createMany: {
            data: input.subStats.map(({ stat, priority }) => ({
              statName: stat,
              priority,
            })),
          },
        },
      },
    });
  }),
  editCharacter: procedure
    .input(
      characterSchema.extend({
        originalName: z
          .string()
          .min(1, { message: "Original name is required." }),
      }),
    )
    .mutation(async ({ input }) => {
      const originalCharacter = await getCharacterFull(input.originalName);

      if (!originalCharacter)
        throw new Error(`Cannot find ${input.originalName} to edit.`);

      let imageUrl = originalCharacter.thumbnail;
      // reupload image if either name or thumbnail url is different
      // if name different, delete the old file with that name later
      if (
        originalCharacter.name !== input.name ||
        originalCharacter.thumbnail !== input.thumbnail
      ) {
        imageUrl = await uploadImageFromExternalURL(
          input.thumbnail,
          `characters/${input.name}`,
        );
      }

      // if new does not contain original, means its new
      // if original does not contain new, means its deleted
      const newSets = input.sets.filter(
        (newSet) => !originalCharacter.sets.find((ori) => ori.name === newSet),
      );
      const removedSets = originalCharacter.sets.filter(
        (ori) => !input.sets.includes(ori.name),
      );

      const newMainStats = input.mainStats.filter(
        (newStats) =>
          !originalCharacter.characterMainStats.find(
            (ori) =>
              ori.statName === newStats.stat && ori.typeName === newStats.type,
          ),
      );
      const removedMainStats = originalCharacter.characterMainStats.filter(
        (ori) =>
          !input.mainStats.find(
            (stat) => stat.stat === ori.statName && stat.type === ori.typeName,
          ),
      );

      // even if priority changed, we count that as different stat (remove and add back in)
      const newSubstats = input.subStats.filter(
        (stat) =>
          !originalCharacter.characterSubstats.find(
            (ori) =>
              ori.statName === stat.stat && ori.priority === stat.priority,
          ),
      );
      const removedSubstats = originalCharacter.characterSubstats.filter(
        (ori) =>
          !input.subStats.find(
            (stat) =>
              stat.stat === ori.statName && stat.priority === ori.priority,
          ),
      );

      await db.character.update({
        data: {
          name: input.name,
          thumbnail: imageUrl,
          rarity: input.rarity,
          releaseDate: input.releaseDate,
          sets: {
            disconnect: removedSets.map((set) => ({ name: set.name })),
            connect: newSets.map((set) => ({
              name: set,
            })),
          },
          characterMainStats: {
            deleteMany: removedMainStats.map((stat) => ({
              statName: stat.statName,
              typeName: stat.typeName,
            })),
            createMany: {
              data: newMainStats.map((stat) => ({
                statName: stat.stat,
                typeName: stat.type,
              })),
              skipDuplicates: true,
            },
          },
          characterSubstats: {
            deleteMany: removedSubstats.map((stat) => ({
              statName: stat.statName,
              priority: stat.priority,
            })),
            createMany: {
              data: newSubstats.map((stat) => ({
                statName: stat.stat,
                priority: stat.priority,
              })),
              skipDuplicates: true,
            },
          },
        },
        where: {
          name: input.originalName,
        },
      });

      if (input.name !== originalCharacter.name)
        await deleteImage(`characters/${originalCharacter.name}`);
    }),
  deleteCharacter: procedure
    .input(z.string().min(1, { message: "Character name is required" }))
    .mutation(async ({ input }) => {
      await db.character.delete({
        where: {
          name: input,
        },
      });

      await deleteImage(`characters/${input}`);
    }),
});
