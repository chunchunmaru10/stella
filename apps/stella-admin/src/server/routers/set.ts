import { db } from "database";
import { procedure, router } from "../trpc";
import {
  deleteImage,
  uploadImageFromExternalURL,
  validateSet,
} from "@/lib/server/utils";
import { setSchema } from "@/lib/schema";
import { z } from "zod";

export const setRouter = router({
  getAllSets: procedure.query(async () => {
    return await db.set.findMany();
  }),
  addSet: procedure.input(setSchema).mutation(async ({ input }) => {
    await validateSet(input);

    const [setImageUrl, ...pieceImageUrls] = await Promise.all([
      uploadImageFromExternalURL(input.thumbnail, `sets/${input.name}`),
      ...input.pieces.map((piece) =>
        uploadImageFromExternalURL(piece.thumbnail, `pieces/${piece.name}`),
      ),
    ]);

    await db.set.create({
      data: {
        name: input.name,
        thumbnail: setImageUrl,
        pieces: {
          create: input.pieces.map((piece, i) => ({
            name: piece.name,
            thumbnail: pieceImageUrls[i],
            typeName: piece.type,
          })),
        },
      },
    });
  }),
  editSet: procedure
    .input(
      setSchema.extend({
        originalName: z
          .string()
          .min(1, { message: "Original name is required" }),
      }),
    )
    .mutation(async ({ input }) => {
      const originalSet = await db.set.findFirst({
        include: {
          pieces: true,
        },
        where: {
          name: input.originalName,
        },
      });

      if (!originalSet) throw new Error("Could not find set to edit.");

      await validateSet(input);

      if (
        input.thumbnail !== originalSet.thumbnail ||
        input.name !== originalSet.name
      )
        input.thumbnail = await uploadImageFromExternalURL(
          input.thumbnail,
          `sets/${input.name}`,
        );

      if (input.name !== originalSet.name)
        await deleteImage(`sets/${originalSet.name}`);

      input.pieces = input.pieces.sort((a, b) => a.type.localeCompare(b.type));
      originalSet.pieces = originalSet.pieces.sort((a, b) =>
        a.typeName.localeCompare(b.typeName),
      );

      for (let i = 0; i < input.pieces.length; i++) {
        const inputPiece = input.pieces[i];
        const originalPiece = originalSet.pieces[i];
        if (inputPiece.thumbnail !== originalPiece.thumbnail) {
          inputPiece.thumbnail = await uploadImageFromExternalURL(
            inputPiece.thumbnail,
            `pieces/${inputPiece.name}`,
          );
        }
        if (inputPiece.name !== originalPiece.name)
          await deleteImage(`pieces/${originalPiece.name}`);
      }

      await db.set.update({
        data: {
          name: input.name,
          thumbnail: input.thumbnail,
          pieces: {
            deleteMany: {
              setName: input.name,
            },
            createMany: {
              data: input.pieces.map((piece) => ({
                name: piece.name,
                thumbnail: piece.thumbnail,
                typeName: piece.type,
              })),
            },
          },
        },
        where: {
          name: originalSet.name,
        },
      });
    }),
  deleteSet: procedure
    .input(z.string().min(1, { message: "Set name is required" }))
    .mutation(async ({ input }) => {
      const deletedSet = await db.set.delete({
        include: {
          pieces: true,
        },
        where: {
          name: input,
        },
      });

      await Promise.all([
        deleteImage(`sets/${deletedSet.name}`),
        ...deletedSet.pieces.map((piece) =>
          deleteImage(`pieces/${piece.name}`),
        ),
      ]);
    }),
});
