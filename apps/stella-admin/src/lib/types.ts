import type { Set } from "database";

export type ParsedPrydwenCharacter = {
  name: string;
  link: string;
  isNew: boolean;
  sets: Set[];
  mainStats: {
    Body: string[];
    Feet: string[];
    "Planar Sphere": string[];
    "Link Rope": string[];
  };
  substats: string[][];
};
