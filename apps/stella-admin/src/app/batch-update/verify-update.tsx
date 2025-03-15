import { Button } from "@/components/ui/button";
import { ParsedPrydwenCharacter } from "@/lib/types";
import { useMemo } from "react";

export default function VerifyUpdate({
  parsedCharacters,
  backToSelectCharactersStage,
}: {
  parsedCharacters: ParsedPrydwenCharacter[];
  backToSelectCharactersStage: () => void;
}) {
  const { existingCharacters, newCharacters } = useMemo(() => {
    const existingCharacters: ParsedPrydwenCharacter[] = [];
    const newCharacters: ParsedPrydwenCharacter[] = [];

    for (const char of parsedCharacters) {
      if (char.isNew) newCharacters.push(char);
      else existingCharacters.push(char);
    }

    return { existingCharacters, newCharacters };
  }, [parsedCharacters]);

  return (
    <>
      {!existingCharacters.length && !newCharacters.length ? (
        <>
          <p>No characters to update. Please select characters to reupdate.</p>
          <div className="mt-4 flex justify-end">
            <Button onClick={backToSelectCharactersStage}>
              Back to Select Character
            </Button>
          </div>
        </>
      ) : (
        <>
          {existingCharacters.length && <>Existing Characters</>}
          {newCharacters.length && <>New Characters</>}
        </>
      )}
    </>
  );
}
