import { api } from "@/trpc/server";
import CharacterList from "./character-list";

export default async function Character() {
  const characters = await api.character.getAllCharacters.query();

  return (
    <div className="h-full">
      <div>
        <div>
          <h1 className="text-2xl font-bold">Characters</h1>
        </div>
        <CharacterList allCharacters={characters} />
      </div>
    </div>
  );
}
