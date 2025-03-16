import { Button } from "@/components/ui/button";
import type { CharacterFull, ParsedPrydwenCharacter } from "@/lib/types";
import { Dispatch, SetStateAction, useMemo } from "react";
import CharacterCompareCard from "./character-compare-card";

export default function VerifyUpdate({
  allCharacters,
  parsedCharacters,
  setParsedCharacters,
  backToSelectCharactersStage,
}: {
  allCharacters: CharacterFull[];
  parsedCharacters: ParsedPrydwenCharacter[];
  setParsedCharacters: Dispatch<SetStateAction<ParsedPrydwenCharacter[]>>;
  backToSelectCharactersStage: () => void;
}) {
  const { existingCharacters, newCharacters } = useMemo(() => {
    const existingCharacters: (ParsedPrydwenCharacter & {
      old: CharacterFull;
    })[] = [];
    const newCharacters: ParsedPrydwenCharacter[] = [];

    for (const char of parsedCharacters) {
      const foundChar = allCharacters.find((c) => c.name === char.name);
      if (foundChar) existingCharacters.push({ ...char, old: foundChar });
      else newCharacters.push(char);
    }

    return { existingCharacters, newCharacters };
  }, [parsedCharacters]);

  return (
    <>
      {!existingCharacters.length && !newCharacters.length ? (
        <div className="flex flex-col items-center justify-center gap-4">
          <p>No characters to update. Please select characters to reupdate.</p>
          <Button onClick={backToSelectCharactersStage}>
            Back to Select Character
          </Button>
        </div>
      ) : (
        <div className="pb-4">
          {existingCharacters.length ? (
            <>
              <h2 className="text-xl font-semibold">Existing Characters</h2>
              <div className="mt-4 space-y-4">
                {existingCharacters.map((existingCharacter) => (
                  <CharacterCompareCard
                    key={existingCharacter.name}
                    existingCharacter={existingCharacter}
                    removeCharacter={() => {
                      setParsedCharacters((prev) =>
                        prev.filter((c) => c.name !== existingCharacter.name),
                      );
                    }}
                  />
                ))}
              </div>
            </>
          ) : null}
          {newCharacters.length ? (
            <>
              <h2 className="text-xl font-semibold">New Characters</h2>
            </>
          ) : null}
        </div>
      )}
    </>
  );
}
