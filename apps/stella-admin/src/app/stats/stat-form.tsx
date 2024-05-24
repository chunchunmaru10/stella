"use client";

import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";
import ThumbnailInput from "@/components/thumbnail-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputWithLabel } from "@/components/ui/input";
import { getStatFull } from "@/lib/server/utils";
import { Save } from "lucide-react";
import { useState } from "react";

type Props = {
  existingStat: Awaited<ReturnType<typeof getStatFull>>;
  allRarities: number[];
};

export default function StatForm({ existingStat }: Props) {
  const [name, setName] = useState(existingStat?.name ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    existingStat?.thumbnail ?? "",
  );
  const [sortOrder, setSortOrder] = useState(existingStat?.sortOrder);

  return (
    <>
      <div className="sticky top-0 flex items-center justify-between bg-background px-2 py-4">
        <h1 className="mr-4 text-2xl font-bold">
          {existingStat ? `Edit Stat` : "Add Stat"}
        </h1>
        <div className="flex items-center gap-4">
          {existingStat && (
            <ConfirmDeleteDialog
              buttonText={`Delete ${existingStat.name}`}
              deleteObjectName={existingStat.name}
              onConfirm={() => {}}
              isLoading={false}
              // onConfirm={() => deleteCharacter(existingCharacter.name)}
              // isLoading={deleteCharacterIsLoading}
            />
          )}
          <Button
            // isLoading={addCharacterIsLoading || editCharacterIsLoading}
            onClick={() => {
              // if (!existingCharacter) startAddCharacter();
              // else startEditCharacter();
            }}
          >
            {existingStat ? (
              <>
                <Save size={20} />
                <span className="ml-2 hidden md:block">Save Changes</span>
              </>
            ) : (
              "Add Character"
            )}
          </Button>
        </div>
      </div>
      <form className="mt-4 flex flex-col gap-6 px-2">
        <InputWithLabel
          label="Character Name"
          id="characterName"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <ThumbnailInput
          thumbnailText={name}
          thumbnailUrl={thumbnailUrl}
          setThumbnailUrl={setThumbnailUrl}
        />
        <InputWithLabel
          label="Sort Order"
          id="sortOrder"
          type="number"
          value={sortOrder}
          onChange={(e) => {
            if (!isNaN(Number(e.target.value)))
              setSortOrder(Number.parseInt(e.target.value));
          }}
        />
        <div className="grid flex-grow items-center gap-1.5">
          <p className="text-sm font-medium leading-none">Main Stat Scaling</p>
          {existingStat?.mainStatScalings.length ? (
            <></>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4">
                <Button>Configure</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
      <div className="h-8" />
    </>
  );
}
