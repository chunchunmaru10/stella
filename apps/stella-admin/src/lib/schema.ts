import { z } from "zod";

export const characterSchema = z.object({
  name: z.string().min(0, { message: "Name is required" }),
  thumbnail: z
    .string()
    .min(1, { message: "Thumbnail URL is required" })
    .url({ message: "Invalid URL" }),
  rarity: z
    .number()
    .min(4, { message: "Rarity must be only 4 or 5" })
    .max(5, { message: "Rarity must be only 4 or 5" }),
  releaseDate: z.date({ message: "Invalid date" }),
  sets: z
    .array(z.string().min(1, { message: "Set name cannot be empty" }))
    .min(1, { message: "Character must at least have 1 best set" }),
  mainStats: z
    .array(
      z.object({
        stat: z.string().min(1),
        type: z.string().min(1),
      }),
    )
    .superRefine((val, ctx) => {
      if (!val.find((stat) => stat.type === "Body"))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must have at least 1 main stat for Body",
        });
      if (!val.find((stat) => stat.type === "Feet"))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must have at least 1 main stat for Feet",
        });
      if (!val.find((stat) => stat.type === "Planar Sphere"))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must have at least 1 main stat for Planar Sphere",
        });
      if (!val.find((stat) => stat.type === "Link Rope"))
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must have at least 1 main stat for Link Rope",
        });
    }),
  subStats: z
    .array(
      z.object({
        stat: z.string().min(1),
        priority: z.number().min(1),
      }),
    )
    .min(1, { message: "Substats is required" }),
});

export const editCharacterSchema = characterSchema.extend({
  originalName: z.string().min(1, "Original name is required."),
});

export const batchUpdateCharacterSchema = z.array(editCharacterSchema);

export const setSchema = z.object({
  name: z.string().min(1, { message: "Set name is required" }),
  thumbnail: z
    .string()
    .min(1, { message: "Thumbnail is required" })
    .url("Invalid thumbnail URL"),
  pieces: z
    .array(
      z.object({
        name: z.string().min(1, {
          message: "Piece name is required",
        }),
        thumbnail: z
          .string()
          .min(1, {
            message: "Thumbnail is required",
          })
          .url("Invalid thumbnail URL"),
        type: z.string().min(1, { message: "Piece type is required" }),
      }),
    )
    .min(2, { message: "Too little pieces." })
    .max(4, { message: "Too many pieces" }),
});

export const statSchema = z.object({
  name: z.string().min(1, "Stat name is required"),
  alternativeNames: z.array(
    z.string().min(1, "Alternative name must not be empty"),
  ),
  thumbnail: z
    .string()
    .min(1, "Thumbnail is required")
    .url("Invalid thumbnail URL"),
  sortOrder: z.number(),
  showPercentage: z.boolean(),
  mainStatScalings: z.object({
    canBeMainStat: z.boolean(),
    scalings: z.array(
      z.object({
        rarityId: z.number().positive("Invalid rarity"),
        baseValue: z.number().positive("Base value must be positive"),
        scalingValue: z.number().positive("Scaling value must be positive"),
      }),
    ),
  }),
  subStatScalings: z.object({
    canBeSubstat: z.boolean(),
    scalings: z.array(
      z.object({
        rarityId: z.number().positive("Invalid rarity"),
        scalingValue: z.number().positive("Invalid scaling value"),
      }),
    ),
  }),
});
