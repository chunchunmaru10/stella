import { getStatFull } from "@/lib/server/utils";
import { notFound } from "next/navigation";
import StatForm from "../stat-form";
import { api } from "@/trpc/server";

export default async function EditStatPage({
  params,
}: {
  params: { stat: string };
}) {
  const statName = decodeURIComponent(params.stat);
  const stat = await getStatFull(statName);
  const allRarities = await api.rarity.getRarities.query();

  if (!stat) notFound();

  return (
    <StatForm
      existingStat={stat}
      allRarities={allRarities.map((r) => r.rarity)}
    />
  );
}
