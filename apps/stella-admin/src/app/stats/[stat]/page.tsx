import { getStatFull } from "@/lib/server/utils";
import { notFound } from "next/navigation";
import StatForm from "../stat-form";
import { db } from "database";

export default async function EditStatPage({
  params,
}: {
  params: { stat: string };
}) {
  const statName = decodeURI(params.stat);
  const stat = await getStatFull(statName);
  const allRarities = await db.rarity.findMany();

  if (!stat) notFound();

  return (
    <StatForm
      existingStat={stat}
      allRarities={allRarities.map((r) => r.rarity)}
    />
  );
}
