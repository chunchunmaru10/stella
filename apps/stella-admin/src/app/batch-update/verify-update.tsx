import { Button } from "@/components/ui/button";
import type { CharacterFull, ParsedPrydwenCharacter } from "@/lib/types";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import CharacterCompareCard from "./character-compare-card";
import NewCharacterCard from "./new-character-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const [toUpdate, setToUpdate] = useState(existingCharacters);
  const [toAdd, setToAdd] = useState(newCharacters);

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
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Batch Apply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] justify-center gap-3 pb-4">
                {parsedCharacters.map((char) => (
                  <div key={char.name} className="flex items-center gap-2">
                    <Checkbox
                      id={`${char.name}-batch-apply`}
                      checked={
                        !!toUpdate.find((c) => c.name === char.name) ||
                        !!toAdd.find((c) => c.name === char.name)
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          if (char.isNew) {
                            const found = newCharacters.find(
                              (c) => c.name === char.name,
                            );
                            if (!found) return;
                            setToAdd((prev) => [...prev, found]);
                          } else {
                            const found = existingCharacters.find(
                              (c) => c.name === char.name,
                            );
                            if (!found) return;
                            setToUpdate((prev) => [...prev, found]);
                          }
                        } else {
                          setToUpdate((prev) =>
                            prev.filter((c) => c.name !== char.name),
                          );
                          setToAdd((prev) =>
                            prev.filter((c) => c.name !== char.name),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`${char.name}-batch-apply`}>
                      {char.name}
                    </Label>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full">Apply</Button>
            </CardContent>
          </Card>
          <div className="pb-4">
            {newCharacters.length ? (
              <>
                <h2 className="mt-4 text-xl font-semibold">New Characters</h2>
                <div className="mt-4 space-y-4">
                  {newCharacters.map((newCharacter) => (
                    <NewCharacterCard
                      key={newCharacter.name}
                      newCharacter={newCharacter}
                      removeCharacter={() =>
                        setParsedCharacters((prev) =>
                          prev.filter((c) => c.name !== newCharacter.name),
                        )
                      }
                    />
                  ))}
                </div>
              </>
            ) : null}
            {existingCharacters.length ? (
              <>
                <h2 className="mt-4 text-xl font-semibold">
                  Existing Characters
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-2">
                  {existingCharacters.map((existingCharacter) => (
                    <CharacterCompareCard
                      key={existingCharacter.name}
                      existingCharacter={existingCharacter}
                      removeCharacter={() => {
                        setParsedCharacters((prev) =>
                          prev.filter((c) => c.name !== existingCharacter.name),
                        );
                      }}
                      willUpdateApply={
                        !!toUpdate.find(
                          (c) => c.name === existingCharacter.name,
                        )
                      }
                      toggle={() => {
                        if (
                          !!toUpdate.find(
                            (c) => c.name === existingCharacter.name,
                          )
                        ) {
                          setToUpdate((prev) =>
                            prev.filter(
                              (c) => c.name !== existingCharacter.name,
                            ),
                          );
                        } else {
                          const found = existingCharacters.find(
                            (c) => c.name === existingCharacter.name,
                          );
                          if (!found) return;

                          setToUpdate((prev) => [...prev, found]);
                        }
                      }}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
