import { Button } from "@/components/ui/button";
import type { CharacterFull, ParsedPrydwenCharacter } from "@/lib/types";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import CharacterCompareCard from "./character-compare-card";
import NewCharacterCard from "./new-character-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/client";
import { formatZodError } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import React from "react";

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
    const newCharacters: (ParsedPrydwenCharacter & {
      thumbnailUrl: string;
      rarity: number;
      releaseDate: Date | undefined;
    })[] = [];

    for (const char of parsedCharacters) {
      const foundChar = allCharacters.find((c) => c.name === char.name);
      if (foundChar) existingCharacters.push({ ...char, old: foundChar });
      else
        newCharacters.push({
          ...char,
          thumbnailUrl: "",
          rarity: 5,
          releaseDate: undefined,
        });
    }

    return { existingCharacters, newCharacters };
  }, [parsedCharacters]);

  // need these use effects, otherwise when updating/adding single character, the toggle all checkbox on/off button will display incorrectly.
  useEffect(() => {
    setToUpdate((prev) =>
      prev.filter(
        (updateChar) =>
          !!existingCharacters.find((c) => c.name === updateChar.name),
      ),
    );
  }, [existingCharacters]);

  useEffect(() => {
    setToAdd((prev) =>
      prev.filter(
        (newChar) => !!existingCharacters.find((c) => c.name === newChar.name),
      ),
    );
  }, [newCharacters]);

  const [toUpdate, setToUpdate] = useState(existingCharacters);
  const [toAdd, setToAdd] = useState(newCharacters);
  const { mutate: batchEdit, isPending: isBatchEditPending } =
    api.character.batchEditCharacters.useMutation({
      onSuccess: () => {
        toast({
          description:
            `Batch edited ${toUpdate.length} character(s) successfully. ` +
            toAdd.length
              ? "Proceeding to batch add. "
              : "",
        });

        setParsedCharacters((prev) =>
          prev.filter(
            (c) => !toUpdate.find((updated) => updated.name === c.name),
          ),
        );

        if (toAdd.length)
          batchAdd(toAdd.map((c) => convertPrydwenCharToAddSchema(c)));
      },
      onError: (e) => {
        let message = formatZodError(e.data?.zodError);
        if (!message) message = e.message;
        toast({
          variant: "destructive",
          description: message,
        });
      },
    });
  const { mutate: batchAdd, isPending: isBatchAddPending } =
    api.character.batchAddCharacters.useMutation({
      onSuccess: () => {
        toast({
          description: `Batch added ${toAdd.length} character(s) successfully.`,
        });
        setParsedCharacters((prev) =>
          prev.filter((c) => !toAdd.find((added) => added.name === c.name)),
        );
      },
      onError: (e) => {
        let message = formatZodError(e.data?.zodError);
        if (!message) message = e.message;
        toast({
          variant: "destructive",
          description: message,
        });
      },
    });

  function convertPrydwenCharToEditSchema(
    prydwenChar: (typeof existingCharacters)[number],
  ) {
    return {
      name: prydwenChar.old.name,
      thumbnail: prydwenChar.old.thumbnail,
      rarity: prydwenChar.old.rarity,
      releaseDate: prydwenChar.old.releaseDate,
      sets: prydwenChar.sets,
      mainStats: Object.keys(prydwenChar.mainStats)
        .map((key) =>
          prydwenChar.mainStats[key as keyof typeof prydwenChar.mainStats].map(
            (stat) => ({
              type: key,
              stat: stat,
            }),
          ),
        )
        .flat(),
      subStats: prydwenChar.substats
        .map((priority, i) =>
          priority.map((stat) => ({
            stat,
            priority: i + 1,
          })),
        )
        .flat(),
      originalName: prydwenChar.old.name,
      lastAutoRun: new Date(),
    };
  }

  function convertPrydwenCharToAddSchema(
    prydwenChar: (typeof newCharacters)[number],
  ) {
    // THIS SHOULD NOT HAPPEN, THE FUNCION CALLING THIS SHOULD CHECK IF RELEASE DATE IS EMPTY, THIS THROW IS JUST FOR ENFORCING TYPE
    if (!prydwenChar.releaseDate) {
      throw new Error(`${prydwenChar.name} is missing release date.`);
    }

    return {
      name: prydwenChar.name,
      thumbnail: prydwenChar.thumbnailUrl,
      rarity: prydwenChar.rarity,
      releaseDate: prydwenChar.releaseDate,
      sets: prydwenChar.sets,
      mainStats: Object.keys(prydwenChar.mainStats)
        .map((slot) =>
          prydwenChar.mainStats[slot as keyof typeof prydwenChar.mainStats].map(
            (stat) => ({
              type: slot,
              stat,
            }),
          ),
        )
        .flat(),
      subStats: prydwenChar.substats
        .map((stats, i) =>
          stats.map((stat) => ({
            priority: i + 1,
            stat,
          })),
        )
        .flat(),
    };
  }

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
                      {char.name} {char.isNew ? "(New)" : ""}
                    </Label>
                  </div>
                ))}
              </div>
              <Button
                className="mt-4 w-full"
                variant="outline"
                onClick={() => {
                  if (
                    toUpdate.length === existingCharacters.length &&
                    toAdd.length === newCharacters.length
                  ) {
                    setToUpdate([]);
                    setToAdd([]);
                  } else {
                    setToUpdate(existingCharacters);
                    setToAdd(newCharacters);
                  }
                }}
              >
                {toUpdate.length === existingCharacters.length &&
                toAdd.length === newCharacters.length
                  ? "Toggle Off"
                  : "Toggle On"}
              </Button>
              <Button
                className="mt-4 w-full"
                isLoading={isBatchEditPending || isBatchAddPending}
                onClick={() => {
                  // check if all new character data has been filled in
                  for (const addChar of toAdd) {
                    if (!addChar.thumbnailUrl) {
                      toast({
                        description: `New character ${addChar.name} is missing thumbnail URL.`,
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!addChar.releaseDate) {
                      toast({
                        description: `New character ${addChar.releaseDate} is missing release date.`,
                        variant: "destructive",
                      });
                      return;
                    }
                  }

                  batchEdit(
                    toUpdate.map((c) => convertPrydwenCharToEditSchema(c)),
                  );
                }}
              >
                Apply
              </Button>
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
                      setToAdd={setToAdd}
                      isLoading={isBatchAddPending || isBatchEditPending}
                      convertPrydwenCharToAddSchema={
                        convertPrydwenCharToAddSchema
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
                      isLoading={isBatchEditPending || isBatchAddPending}
                      convertPrydwenCharToEditSchema={
                        convertPrydwenCharToEditSchema
                      }
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
