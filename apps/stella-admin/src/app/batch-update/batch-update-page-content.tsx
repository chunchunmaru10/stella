"use client";
import { Character } from "database";
import CharacterToggleList from "./character-toggle-list";
import { useState } from "react";

export default function BatchUpdatePageContent({
  characters,
}: {
  characters: Character[];
}) {
  const [selectedCharacters, setSelectedCharacters] = useState(characters);

  return (
    <>
      <CharacterToggleList
        characters={characters}
        selectedCharacters={selectedCharacters}
        setSelectedCharacters={setSelectedCharacters}
      />
    </>
  );
}
