import { db } from "database";
import { firebaseStorage } from "@/server/firebase";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { setSchema } from "../schema";
import { z } from "zod";
import { Type } from "database";

export async function getCharacterFull(characterName: string) {
  return await db.character.findFirst({
    include: {
      sets: true,
      characterMainStat: {
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
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
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
