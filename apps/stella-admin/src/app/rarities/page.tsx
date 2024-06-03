import { api } from "@/trpc/server";
import RarityPageContent from "./page-content";

export default async function Rarities() {
  const allRarities = await api.rarity.getRarities.query();

  return (
    <div className="h-full">
      <RarityPageContent allRarities={allRarities} />
    </div>
  );
}
