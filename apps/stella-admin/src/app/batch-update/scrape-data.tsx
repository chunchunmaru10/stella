import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ParsedPrydwenCharacter } from "@/lib/types";
import { formatZodError } from "@/lib/utils";
import { api } from "@/trpc/client";
import { Character } from "database";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ScrapeData({
  selectedCharacters,
  setPreviousStage,
  onDone,
}: {
  selectedCharacters: Character[];
  setPreviousStage: () => void;
  onDone: (parsedCharacters: ParsedPrydwenCharacter[]) => void;
}) {
  const logTypes = ["info", "error", "success"] as const;
  const [shouldCheckNewCharacters, setShouldCheckNewCharacters] =
    useState(false);
  const [logFilter, setLogFilters] = useState<(typeof logTypes)[number][]>([
    ...logTypes,
  ]);
  const [isDone, setIsDone] = useState(false);
  const [batchEnabled, setBatchEnabled] = useState(false);
  const [parsedCharacters, setParsedCharacters] = useState<
    ParsedPrydwenCharacter[]
  >([]);
  const [logs, setLogs] = useState<
    { message: string; type: (typeof logTypes)[number] }[]
  >([]);

  const { data: iterable, error } = api.character.batchFetchCharacters.useQuery(
    {
      shouldCheckForNewCharacters: shouldCheckNewCharacters,
      characters: selectedCharacters.map((c) => c.name),
    },
    {
      enabled: batchEnabled,
      retry: false,
    },
  );

  const bottomDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!batchEnabled || (!iterable?.length && !error)) return;

    const logsToPush: typeof logs = [];
    for (const data of iterable ?? []) {
      if (data.done) {
        setIsDone(true);
        setParsedCharacters(data.data);
        break;
      }

      logsToPush.push(data.data);
    }

    if (error) {
      setIsDone(true);
      let message = formatZodError(error.data?.zodError);
      if (!message) message = error.message;

      logsToPush.push({
        message,
        type: "error",
      });
    }

    setLogs(logsToPush);
  }, [iterable, error]);

  useEffect(() => {
    bottomDivRef.current?.scrollIntoView();
  }, [logs]);

  return (
    <>
      {!batchEnabled || !iterable ? (
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
                          className="h-auto w-auto"
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
          <div className="mb-4 flex w-full flex-wrap gap-2">
            {logTypes.map((type) => (
              <Card
                key={type}
                className="flex flex-1 items-center space-x-4 p-4"
              >
                <Switch
                  id={type + "Switch"}
                  checked={logFilter.includes(type)}
                  onCheckedChange={(checked) => {
                    if (checked) setLogFilters((prev) => [...prev, type]);
                    else
                      setLogFilters((prev) => prev.filter((t) => t !== type));
                  }}
                />
                <Label htmlFor={type + "Switch"}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Label>
              </Card>
            ))}
          </div>
          <div className="max-h-[40vh] overflow-y-auto rounded-md border border-primary-foreground p-4 pb-6 scrollbar-thin md:max-h-[70vh]">
            {logs
              .filter((l) => logFilter.includes(l.type))
              .map((log, i) => (
                <pre
                  key={i}
                  className={`${log.type === "info" ? "text-primary" : log.type === "success" ? "text-green-500" : "text-red-500"} text-wrap`}
                >
                  {log.message}
                </pre>
              ))}
            <div ref={bottomDivRef} />
          </div>
          <div className="mt-4 flex w-full flex-wrap justify-end gap-4">
            {(error || (!parsedCharacters.length && isDone)) && (
              <Button variant="outline" onClick={setPreviousStage}>
                Back to Select Characters
              </Button>
            )}
            {parsedCharacters.length && isDone ? (
              <Button onClick={() => onDone(parsedCharacters)}>
                Proceed to Verify Update
              </Button>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
