import { AppRouter } from "@/server";
import { inferRouterOutputs } from "@trpc/server";

export type CharacterFull =
  inferRouterOutputs<AppRouter>["character"]["getAllCharactersFull"][number];

export type ParsedPrydwenCharacter = {
  name: string;
  link: string;
  isNew: boolean;
  sets: string[];
  mainStats: {
    Body: string[];
    Feet: string[];
    "Planar Sphere": string[];
    "Link Rope": string[];
  };
  substats: string[][];
};
