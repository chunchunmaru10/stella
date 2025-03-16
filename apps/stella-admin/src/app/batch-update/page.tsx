import { api } from "@/trpc/server";
import BatchUpdatePageContent from "./batch-update-page-content";

export default async function BatchUpdatePage() {
  const characters = await api.character.getAllCharactersFull.query();

  return (
    <>
      <BatchUpdatePageContent characters={characters} />
    </>
  );
}
