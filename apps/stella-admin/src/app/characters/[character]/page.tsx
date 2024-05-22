import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import CharacterForm from "../character-form";
import { getCharacterFull } from "@/lib/server/utils";

export default async function EditCharacterPage({
  params,
}: {
  params: { character: string };
}) {
  const characterName = decodeURI(params.character);
  const character = await getCharacterFull(characterName);
  const allSets = await api.set.getAllSets.query();
  const allTypes = await api.type.getAllTypesExcludingFixed.query();
  const allSubstats = await api.stat.getAllSubstats.query();

  if (!character) notFound();

  return (
    <CharacterForm
      allSets={allSets}
      allTypes={allTypes}
      allSubstats={allSubstats}
      existingCharacter={character}
    />
  );
}
