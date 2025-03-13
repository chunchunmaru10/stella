import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/client";
import { Character } from "database";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ScrapeData({
  selectedCharacters,
  setPreviousStage,
  setNextStage,
}: {
  selectedCharacters: Character[];
  setPreviousStage: () => void;
  setNextStage: () => void;
}) {
  const [shouldCheckNewCharacters, setShouldCheckNewCharacters] =
    useState(false);
  const [batchEnabled, setBatchEnabled] = useState(false);
  const { data } = api.character.batchUpdateCharacters.useQuery(
    {
      shouldCheckForNewCharacters: shouldCheckNewCharacters,
      characters: selectedCharacters.map((c) => c.name),
    },
    {
      enabled: batchEnabled,
    },
  );

  useEffect(() => {
    if (!batchEnabled) return;

    console.log(data);
  }, [data]);

  return (
    <>
      {!batchEnabled || !data ? (
        <>
          {selectedCharacters.length === 0 ? (
            <p>
              You have not selected any characters. Please enable check for new
              characters to proceed.
            </p>
          ) : (
            <>
              <p>The following character(s) will be updated: </p>
              <ul className="mt-4 grid w-full grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] justify-center gap-4">
                {selectedCharacters.map((character) => (
                  <li key={character.name} className="flex items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full ${character.rarity === 5 ? "bg-gold-medium" : "bg-purple-light"} min-h-10 min-w-10`}
                      >
                        <Image
                          src={character.thumbnail}
                          alt={character.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <span>{character.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-4 flex items-center gap-4">
            <Switch
              checked={shouldCheckNewCharacters}
              onCheckedChange={setShouldCheckNewCharacters}
              id="should-check-new-character"
            />
            <Label htmlFor="should-check-new-character">
              Check For New Characters
            </Label>
          </div>
          <div className="mt-4 flex w-full justify-end gap-4">
            <Button variant="outline" onClick={setPreviousStage}>
              Cancel
            </Button>
            <Button
              disabled={
                !shouldCheckNewCharacters && selectedCharacters.length === 0
              }
              onClick={() => setBatchEnabled(true)}
            >
              Proceed
            </Button>
          </div>
        </>
      ) : (
        <>
          <div>
            {data.map((d) => (
              <pre key={d}>{d}</pre>
            ))}
          </div>
        </>
      )}
    </>
  );
}
