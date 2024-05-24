"use client";

import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next-nprogress-bar";
import { Character } from "database";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import SortableTableHead from "@/components/sortable-table-head";
import PaginationFull from "@/components/pagination-full";

export default function CharacterList({
  allCharacters,
}: {
  allCharacters: Character[];
}) {
  const pageSize = 7;

  const [currentPage, setCurrentPage] = useState(0);
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState<{
    key: string;
    order: "asc" | "desc";
  }>({
    key: "Name",
    order: "asc",
  });
  const filteredAndSortedCharacters = useMemo(
    () =>
      allCharacters
        .filter((c) =>
          c.name.toLocaleLowerCase().replace(" ", "").includes(filterText),
        )
        .sort((a, b) => {
          const smaller = sortBy.order === "asc" ? a : b;
          const bigger = sortBy.order === "asc" ? b : a;

          switch (sortBy.key) {
            case "Rarity":
              return bigger.rarity - smaller.rarity;
            case "Release Date":
              return (
                bigger.releaseDate.getTime() - smaller.releaseDate.getTime()
              );
            default:
              return smaller.name.localeCompare(bigger.name);
          }
        }),
    [sortBy, filterText, allCharacters],
  );
  const router = useRouter();

  const maxPage = useMemo(() => {
    return Math.max(
      0,
      Math.ceil(filteredAndSortedCharacters.length / pageSize) - 1,
    );
  }, [filteredAndSortedCharacters]);

  useEffect(() => {
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [currentPage, maxPage]);

  return (
    <>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="max-w-96 flex-grow pr-9"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
        </div>
        <Button asChild>
          <Link href="/characters/add">
            <Plus size={16} /> <span className="ml-2">Add New</span>
          </Link>
        </Button>
      </div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <SortableTableHead
              className="w-2/3 min-w-64"
              columnName="Name"
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <SortableTableHead
              columnName="Rarity"
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            <SortableTableHead
              columnName="Release Date"
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedCharacters.length ? (
            filteredAndSortedCharacters
              .slice(
                Math.min(
                  currentPage * pageSize,
                  Math.max(filteredAndSortedCharacters.length - 1, 0),
                ),
                Math.min(
                  (currentPage + 1) * pageSize,
                  filteredAndSortedCharacters.length + pageSize - 1,
                ),
              )
              .map((character) => (
                <TableRow
                  key={character.name}
                  role="link"
                  onClick={() => {
                    router.push(
                      `/characters/${encodeURIComponent(character.name)}`,
                      {
                        scroll: false,
                      },
                    );
                  }}
                  className="cursor-pointer"
                  tabIndex={0}
                >
                  <TableCell className="flex items-center gap-4">
                    <Image
                      src={character.thumbnail}
                      alt={character.name}
                      width={40}
                      height={40}
                      className="aspect-square object-scale-down"
                    />
                    {character.name}
                  </TableCell>
                  <TableCell>{character.rarity}</TableCell>
                  <TableCell>{format(character.releaseDate, "PP")}</TableCell>
                </TableRow>
              ))
          ) : (
            <TableRow className="hover:bg-background">
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                No Characters Found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaginationFull
        maxPage={maxPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
}
