"use client";

import ThumbnailInput from "@/components/thumbnail-input";
import { Button } from "@/components/ui/button";
import { InputWithLabel } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { formatZodError } from "@/lib/utils";
import { api } from "@/trpc/client";
import { Piece, Type } from "database";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import SelectPiece from "./select-piece";
import { getSetFull } from "@/lib/server/utils";
import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";
import { Save } from "lucide-react";

type Props = {
  allTypes: Type[];
  existingSet?: Awaited<ReturnType<typeof getSetFull>>;
};

export default function SetForm({ allTypes, existingSet }: Props) {
  const [name, setName] = useState(existingSet?.name ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    existingSet?.thumbnail ?? "",
  );
  const [pieces, setPieces] = useState<Piece[]>(existingSet?.pieces ?? []);
  const router = useRouter();
  const { mutate: addSet, isPending: addSetLoading } =
    api.set.addSet.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          description: `${name} added successfully`,
        });
        router.push("/sets");
      },
      onError: (e) => {
        let msg = formatZodError(e.data?.zodError);
        if (!msg) msg = e.message;

        toast({
          variant: "destructive",
          description: msg,
        });
      },
    });
  const { mutate: editSet, isPending: editSetIsLoading } =
    api.set.editSet.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          description: `${name} edited successfully`,
        });
        router.replace(`/sets/${name}`, {
          scroll: false,
        });
      },
      onError: (e) => {
        const fieldErrors = e.data?.zodError?.fieldErrors;
        let message = "";

        if (fieldErrors) message = formatZodError(e.data.zodError);
        else message = e.message;

        toast({
          variant: "destructive",
          description: message,
        });
      },
    });
  const { mutate: deleteSet, isPending: deleteSetIsLoading } =
    api.set.deleteSet.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          description: `${existingSet?.name ?? "Set"} deleted successfully`,
        });
        router.replace("/sets");
      },
      onError: (e) => {
        const formErrors = e.data?.zodError?.formErrors;
        let message = "";
        if (formErrors?.[0]) message = formErrors[0];
        else message = e.message;

        toast({
          variant: "destructive",
          description: message,
        });
      },
    });

  function startAddSet() {
    try {
      if (!name) throw new Error("Name is required");
      if (!thumbnailUrl) throw new Error("Thumbnail is required.");

      addSet({
        name,
        thumbnail: thumbnailUrl,
        pieces: pieces.map((piece) => ({
          name: piece.name,
          thumbnail: piece.thumbnail,
          type: piece.typeName,
        })),
      });
    } catch (e) {
      let description = "Something went wrong. Please try again.";
      if (e instanceof Error) description = e.message;

      toast({
        variant: "destructive",
        description,
      });
    }
  }

  function startEditSet() {
    try {
      if (!existingSet) throw new Error("Cannot edit this set");
      if (!name) throw new Error("Name is required");
      if (!thumbnailUrl) throw new Error("Thumbnail is required.");

      editSet({
        name,
        thumbnail: thumbnailUrl,
        pieces: pieces.map((piece) => ({
          name: piece.name,
          thumbnail: piece.thumbnail,
          type: piece.typeName,
        })),
        originalName: existingSet.name,
      });
    } catch (e) {
      let description = "Something went wrong. Please try again.";
      if (e instanceof Error) description = e.message;

      toast({
        variant: "destructive",
        description,
      });
    }
  }

  return (
    <>
      <div className="sticky top-0 flex items-center justify-between bg-background px-2 py-4">
        <h1 className="mr-4 text-2xl font-bold">
          {existingSet ? "Edit" : "Add"} Set
        </h1>
        <div className="flex items-center gap-4">
          {existingSet && (
            <ConfirmDeleteDialog
              buttonText="Delete Set"
              deleteObjectName={existingSet.name}
              isLoading={deleteSetIsLoading}
              onConfirm={() => deleteSet(existingSet.name)}
            />
          )}
          <Button
            onClick={() => {
              if (!existingSet) startAddSet();
              else startEditSet();
            }}
            isLoading={addSetLoading || editSetIsLoading}
          >
            {existingSet ? (
              <>
                <Save size={20} />
                <span className="ml-2 hidden md:block">Save Changes</span>
              </>
            ) : (
              "Add Set"
            )}
          </Button>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-6 p-2">
        <InputWithLabel
          label="Set Name"
          id="setName"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <ThumbnailInput
          thumbnailText={name}
          thumbnailUrl={thumbnailUrl}
          setThumbnailUrl={setThumbnailUrl}
        />
        <div>
          <p className="mb-1.5 text-sm font-medium leading-none">
            Relic Pieces
          </p>
          <Tabs defaultValue="cavernRelics" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="cavernRelics" className="w-full">
                Cavern Relics
              </TabsTrigger>
              <TabsTrigger value="planarOrnaments" className="w-full">
                Planar Ornaments
              </TabsTrigger>
            </TabsList>
            <TabsContent value="cavernRelics">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {allTypes.slice(0, 4).map((type) => (
                  <SelectPiece
                    piece={pieces.find((piece) => piece.typeName === type.name)}
                    setPieces={setPieces}
                    type={type}
                    key={type.name}
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="planarOrnaments">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {allTypes.slice(4, 6).map((type) => (
                  <SelectPiece
                    piece={pieces.find((piece) => piece.typeName === type.name)}
                    setPieces={setPieces}
                    type={type}
                    key={type.name}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className="h-8" />
    </>
  );
}
