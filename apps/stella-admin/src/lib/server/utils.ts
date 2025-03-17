import { db } from "database";
import { firebaseStorage } from "@/server/firebase";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  batchUpdateCharacterSchema,
  batchAddCharacterSchema,
  setSchema,
} from "../schema";
import { z } from "zod";
import { Type } from "database";
import { api } from "@/trpc/server";

export async function getCharacterFull(characterName: string) {
  return await db.character.findFirst({
    include: {
      sets: true,
      characterMainStats: {
        include: {
          stat: true,
          type: true,
        },
      },
      characterSubstats: {
        include: {
          stat: true,
        },
      },
    },
    where: {
      name: characterName,
    },
  });
}

export async function getSetFull(setName: string) {
  return await db.set.findFirst({
    include: {
      pieces: true,
    },
    where: {
      name: setName,
    },
  });
}

export async function getStatFull(statName: string) {
  return await db.stat.findFirst({
    include: {
      mainStatScalings: true,
      subStatScalings: true,
      types: true,
    },
    where: {
      name: statName,
    },
  });
}

export async function uploadImageFromExternalURL(
  externalURL: string,
  path: string,
) {
  try {
    if (!URL.canParse(externalURL)) throw new Error("Invalid URL");

    const res = await fetch(externalURL);

    if (!res.ok)
      throw new Error(
        "Something went wrong while fetching image from external URL",
      );

    const blob = await res.blob();
    const file = new File([blob], "", { type: blob.type });
    if (!["image/png", "image/jpeg", "image/webp", ""].includes(file.type))
      throw new Error("Invalid file type. Must be png, jpeg, or webp");

    const fileRef = ref(firebaseStorage, path);
    await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(fileRef);

    return downloadUrl;
  } catch (e) {
    let message =
      "Something went wrong while uploading image from external URL.";
    if (e instanceof Error) message = e.message;

    throw new Error(message);
  }
}

export async function deleteImage(path: string) {
  await deleteObject(ref(firebaseStorage, path));
}

export async function validateSet(set: z.infer<typeof setSchema>) {
  const types = await db.type.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  if (!types)
    throw new Error("Something went wrong while fetching relic types");

  let remainingTypes: Type[];
  if (set.pieces.length === 4) remainingTypes = types.slice(0, 4);
  else if (set.pieces.length === 2) remainingTypes = types.slice(4, 6);
  else throw new Error("Invalid number of pieces");

  // remove the remaining types everytime a piece with a matched type is found
  // if there is no remaining type in the end, we know that all the types match
  for (const piece of set.pieces) {
    remainingTypes = remainingTypes.filter((type) => piece.type !== type.name);
  }

  if (remainingTypes.length !== 0)
    throw new Error(`Invalid piece type. ${remainingTypes[0].name} is missing`);
}

export async function batchAddCharacters(
  characters: z.infer<typeof batchAddCharacterSchema>,
) {
  db.$transaction(
    async (tx) => {
      await Promise.all(
        characters.map(async (input) => {
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
      );
    },
    {
      timeout: 30000,
    },
  );
}

export async function batchUpdateCharacters(
  characters: z.infer<typeof batchUpdateCharacterSchema>,
) {
  const allCharacters = await api.character.getAllCharactersFull.query();

  db.$transaction(
    async (tx) => {
      await Promise.all(
        characters.map(async (input) => {
          const originalCharacter = allCharacters.find(
            (c) => c.name === input.originalName,
          );

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
            (newSet) =>
              !originalCharacter.sets.find((ori) => ori.name === newSet),
          );
          const removedSets = originalCharacter.sets.filter(
            (ori) => !input.sets.includes(ori.name),
          );

          const newMainStats = input.mainStats.filter(
            (newStats) =>
              !originalCharacter.characterMainStats.find(
                (ori) =>
                  ori.statName === newStats.stat &&
                  ori.typeName === newStats.type,
              ),
          );
          const removedMainStats = originalCharacter.characterMainStats.filter(
            (ori) =>
              !input.mainStats.find(
                (stat) =>
                  stat.stat === ori.statName && stat.type === ori.typeName,
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

          await tx.character.update({
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
              lastAutoRunAt: input.lastAutoRun,
            },
            where: {
              name: input.originalName,
            },
          });

          if (input.name !== originalCharacter.name)
            await deleteImage(`characters/${originalCharacter.name}`);
        }),
      );
    },
    {
      timeout: 30000,
    },
  );
}
