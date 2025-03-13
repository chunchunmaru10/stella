import SortableTableHead from "@/components/sortable-table-head";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Character } from "database";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import Image from "next/image";
import { type Dispatch, type SetStateAction, useState, useMemo } from "react";

export default function CharacterToggleList({
  characters,
  selectedCharacters,
  setSelectedCharacters,
}: {
  characters: Character[];
  selectedCharacters: Character[];
  setSelectedCharacters: Dispatch<SetStateAction<Character[]>>;
}) {
  const [shouldCheckNewCharacter, setShouldCheckNewCharacter] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<{
    key: string;
    order: "asc" | "desc";
  }>({
    key: "Name",
    order: "asc",
  });
  const filteredAndSortedCharacters = useMemo(
    () =>
      characters
        .filter((c) =>
          c.name
            .toLocaleLowerCase()
            .replaceAll(" ", "")
            .includes(filter.toLocaleLowerCase().replaceAll(" ", "")),
        )
        .sort((a, b) => {
          const smaller = sortBy.order === "asc" ? a : b;
          const bigger = sortBy.order === "asc" ? b : a;

          switch (sortBy.key) {
            case "Last Updated":
              return bigger.updatedAt.getTime() - smaller.updatedAt.getTime();
            case "Last Auto Run":
              return (
                bigger.lastAutoRunAt.getTime() - smaller.lastAutoRunAt.getTime()
              );
            default:
              return smaller.name.localeCompare(bigger.name);
          }
        }),
    [sortBy, filter, characters],
  );

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="relative max-w-64 flex-1">
            <Input
              placeholder="Search"
              id="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Proceed</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-h-[95vh]">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Batch Update</AlertDialogTitle>
              </AlertDialogHeader>
              <div>
                {selectedCharacters.length ? (
                  <>
                    <p className="text-left">
                      The following characters will be updated (
                      {selectedCharacters.length} in total):{" "}
                    </p>
                    <ul className="mt-4 max-h-[50vh] list-inside list-disc overflow-y-auto text-left scrollbar-thin">
                      {selectedCharacters.map((character) => (
                        <li key={character.name}>{character.name}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>
                    No existing characters will be updated. Please enable
                    checking for new characters to proceed.
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Switch
                    id="check-new-characters-toggle"
                    checked={shouldCheckNewCharacter}
                    onCheckedChange={setShouldCheckNewCharacter}
                  />
                  <Label htmlFor="check-new-characters-toggle">
                    Check For New Characters
                  </Label>
                </div>
                <DialogFooter className="mt-4">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={
                      selectedCharacters.length === 0 &&
                      !shouldCheckNewCharacter
                    }
                  >
                    Continue
                  </AlertDialogAction>
                </DialogFooter>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="mt-4 max-h-[60vh] overflow-y-auto scrollbar-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={selectedCharacters.length === characters.length}
                  onCheckedChange={(e) => {
                    setSelectedCharacters(e ? characters : []);
                  }}
                />
              </TableHead>
              <SortableTableHead
                columnName="Name"
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
              <SortableTableHead
                columnName="Last Updated"
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
              <SortableTableHead
                columnName="Last Auto Run"
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCharacters.map((character) => (
              <TableRow key={character.name}>
                <TableCell>
                  <Checkbox
                    checked={
                      !!selectedCharacters.find(
                        (c) => c.name === character.name,
                      )
                    }
                    onCheckedChange={(e) => {
                      if (e)
                        setSelectedCharacters((prev) => [...prev, character]);
                      else
                        setSelectedCharacters((prev) =>
                          prev.filter((c) => c.name !== character.name),
                        );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className={"flex items-center gap-4"}>
                    <div
                      className={`${character.rarity === 5 ? "bg-gold-medium" : "bg-purple-light"} rounded-full`}
                    >
                      <Image
                        src={character.thumbnail}
                        alt={character.name}
                        width={40}
                        height={40}
                      />
                    </div>
                    <p>{character.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(character.updatedAt)}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(character.lastAutoRunAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
