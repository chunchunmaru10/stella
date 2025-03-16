"use client";
import CharacterToggleList from "./character-toggle-list";
import { useState } from "react";
import ScrapeData from "./scrape-data";
import { CharacterFull, ParsedPrydwenCharacter } from "@/lib/types";
import VerifyUpdate from "./verify-update";

export default function BatchUpdatePageContent({
  characters,
}: {
  characters: CharacterFull[];
}) {
  const stages = [
    "Select Characters",
    "Scrape Data",
    "Verify Update",
    "Complete",
  ] as const;
  const [stage, setStage] = useState<(typeof stages)[number]>(stages[2]);
  const [selectedCharacters, setSelectedCharacters] = useState(characters);
  const [parsedCharacters, setParsedCharacters] = useState<
    ParsedPrydwenCharacter[]
  >([]);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">{stage}</h1>
      {stage === "Select Characters" && (
        <CharacterToggleList
          characters={characters}
          selectedCharacters={selectedCharacters}
          setSelectedCharacters={setSelectedCharacters}
          onProceedClicked={() => setStage("Scrape Data")}
        />
      )}
      {stage === "Scrape Data" && (
        <ScrapeData
          selectedCharacters={selectedCharacters}
          setPreviousStage={() => setStage("Select Characters")}
          onDone={(parsedCharacters) => {
            setStage("Verify Update");
            setParsedCharacters(parsedCharacters);
          }}
        />
      )}
      {stage === "Verify Update" && (
        <VerifyUpdate
          allCharacters={characters}
          parsedCharacters={parsedCharacters}
          setParsedCharacters={setParsedCharacters}
          backToSelectCharactersStage={() => setStage("Select Characters")}
        />
      )}
    </>
  );
}
