"use client";

import { MultiSelect } from "@/components/multi-select";
import ThumbnailInput from "@/components/thumbnail-input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { InputWithLabel } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatZodError } from "@/lib/utils";
import { AppRouter } from "@/server";
import { Set, Stat } from "@prisma/client";
import { inferRouterOutputs } from "@trpc/server";
import { format } from "date-fns";
import { CalendarIcon, Star } from "lucide-react";
import { useState } from "react";
import SelectSubstats from "./add/select-substats";
import SelectMainStats from "./add/select-main-stats";
import { api } from "@/trpc/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next-nprogress-bar";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getCharacterFull } from "@/lib/server/utils";
import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";

type Props = {
  allSets: Set[];
  allTypes: inferRouterOutputs<AppRouter>["type"]["getAllTypesExcludingFixed"];
  allSubstats: Stat[];
  existingCharacter?: Awaited<ReturnType<typeof getCharacterFull>>;
};

export default function CharacterForm({
  allSets,
  allTypes,
  allSubstats,
  existingCharacter,
}: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [name, setName] = useState(existingCharacter?.name ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    existingCharacter?.thumbnail ?? "",
  );
  const [releaseDate, setReleaseDate] = useState<Date | undefined>(
    existingCharacter?.releaseDate,
  );
  const [rarity, setRarity] = useState<number | null | undefined>(
    existingCharacter?.rarity,
  );
  const [selectedSets, setSelectedSets] = useState<Set[]>(
    existingCharacter?.sets ?? [],
  );
  const [selectedMainStats, setSelectedMainStats] = useState<
    (Stat & {
      type: string;
    })[]
  >(
    existingCharacter?.characterMainStat.map(({ stat, type }) => ({
      ...stat,
      type: type.name,
    })) ?? [],
  );
  const [selectedSubstats, setSelectedSubstats] = useState<
    (Stat & {
      priority: number;
    })[]
  >(
    existingCharacter?.characterSubstats.map(({ stat, priority }) => ({
      ...stat,
      priority,
    })) ?? [],
  );
  const { toast } = useToast();
  const router = useRouter();
  const { isLoading: addCharacterIsLoading, mutate: addCharacter } =
    api.character.addCharacter.useMutation({
      onSuccess: async () => {
        toast({
          variant: "default",
          description: `${name} added successfully`,
        });
        router.push("/characters");
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
  const { isLoading: editCharacterIsLoading, mutate: editCharacter } =
    api.character.editCharacter.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          description: `${name} edited successfully`,
        });
        router.replace(`/characters/${name}`, {
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
  const { isLoading: deleteCharacterIsLoading, mutate: deleteCharacter } =
    api.character.deleteCharacter.useMutation({
      onSuccess: async () => {
        toast({
          variant: "default",
          description: `${existingCharacter?.name ?? name} deleted successfully`,
        });
        router.replace("/characters");
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

  async function startAddCharacter() {
    try {
      if (!name) throw new Error("Name is required");
      if (!thumbnailUrl) throw new Error("Thumbnail is required");
      if (!rarity) throw new Error("Rarity is required");
      if (!releaseDate) throw new Error("Release date is required");

      addCharacter({
        name,
        thumbnail: thumbnailUrl,
        rarity,
        releaseDate,
        sets: selectedSets.map((set) => set.name),
        mainStats: selectedMainStats.map((stat) => ({
          stat: stat.name,
          type: stat.type,
        })),
        subStats: selectedSubstats.map((stat) => ({
          stat: stat.name,
          priority: stat.priority,
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

  async function startEditCharacter() {
    try {
      if (!existingCharacter) throw new Error("Cannot edit this character");
      if (!name) throw new Error("Name is required");
      if (!thumbnailUrl) throw new Error("Thumbnail is required");
      if (!rarity) throw new Error("Rarity is required");
      if (!releaseDate) throw new Error("Release date is required");

      editCharacter({
        name,
        thumbnail: thumbnailUrl,
        rarity,
        releaseDate,
        sets: selectedSets.map((set) => set.name),
        mainStats: selectedMainStats.map((stat) => ({
          stat: stat.name,
          type: stat.type,
        })),
        subStats: selectedSubstats.map((stat) => ({
          stat: stat.name,
          priority: stat.priority,
        })),
        originalName: existingCharacter.name,
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
      <div className="sticky top-0 flex items-center justify-between bg-background pb-4">
        <h1 className="text-2xl font-bold">
          {existingCharacter
            ? `Edit ${existingCharacter.name}`
            : "Add Character"}
        </h1>
        <div className="flex items-center gap-4">
          {existingCharacter && (
            <ConfirmDeleteDialog
              buttonText={`Delete ${existingCharacter.name}`}
              deleteObjectName={existingCharacter.name}
              onConfirm={() => deleteCharacter(existingCharacter.name)}
              isLoading={deleteCharacterIsLoading}
            />
          )}
          <Button
            isLoading={addCharacterIsLoading || editCharacterIsLoading}
            onClick={() => {
              if (!existingCharacter) startAddCharacter();
              else startEditCharacter();
            }}
          >
            {existingCharacter ? "Save Changes" : "Add Character"}
          </Button>
        </div>
      </div>
      <form className="mt-4 flex flex-col gap-6">
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
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="grid flex-grow items-center gap-1.5">
            <p className="text-sm font-medium leading-none">Rarity</p>
            <Select
              value={rarity?.toString()}
              onValueChange={(value) => setRarity(value === "4" ? 4 : 5)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star size={16} />
                      <span>Rarity</span>
                    </div>
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid flex-grow items-center gap-1.5">
            <p className="text-sm font-medium leading-none">Release Date</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !releaseDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-4 h-4 w-4" />
                  {releaseDate ? (
                    format(releaseDate, "PPP")
                  ) : (
                    <span>Release Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={releaseDate}
                  onSelect={setReleaseDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <MultiSelect
          allItems={allSets.filter(
            (all) =>
              !selectedSets.find((selected) => selected.name === all.name),
          )}
          selectedItems={selectedSets}
          addNewItems={(newItems) =>
            setSelectedSets([...selectedSets, ...newItems])
          }
          removeItem={(toBeRemoved) => {
            setSelectedSets(
              selectedSets.filter((set) => set.name !== toBeRemoved.name),
            );
          }}
          label="Relic Sets"
        />
        <SelectMainStats
          allTypes={allTypes}
          selectedMainStats={selectedMainStats}
          setSelectedMainStats={setSelectedMainStats}
        />
        <SelectSubstats
          allSubstats={allSubstats
            .filter(
              (all) =>
                !selectedSubstats.find(
                  (selected) => selected.name === all.name,
                ),
            )
            .sort((a, b) => a.sortOrder - b.sortOrder)}
          selectedSubstats={selectedSubstats}
          setSelectedSubstats={setSelectedSubstats}
        />
      </form>
      <div className="h-8" />
    </>
  );
}
