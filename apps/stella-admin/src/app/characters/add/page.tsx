import { api } from "@/trpc/server";
import CharacterForm from "../character-form";

export default async function AddCharacterPage() {
  const allSets = await api.set.getAllSets.query();
  const allTypes = await api.type.getAllTypesExcludingFixed.query();
  const allSubstats = await api.stat.getAllSubstats.query();

  return (
    <>
      <CharacterForm
        allSets={allSets}
        allTypes={allTypes}
        allSubstats={allSubstats}
      />
    </>
  );
}
