"use client";

import PaginationFull from "@/components/pagination-full";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Set } from "database";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function SetList({ allSets }: { allSets: Set[] }) {
  const pageSize = 7;

  const [currentPage, setCurrentPage] = useState(0);
  const [filterText, setFilterText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const filteredAndSortedSets = useMemo(
    () =>
      allSets
        .filter((s) =>
          s.name
            .toLocaleLowerCase()
            .replaceAll(" ", "")
            .includes(filterText.toLocaleLowerCase().replaceAll(" ", "")),
        )
        .sort((a, b) => {
          const smaller = sortOrder === "asc" ? a : b;
          const bigger = sortOrder === "asc" ? b : a;

          return smaller.name.localeCompare(bigger.name);
        }),
    [sortOrder, filterText, allSets],
  );
  const router = useRouter();

  const maxPage = useMemo(() => {
    return Math.max(0, Math.ceil(filteredAndSortedSets.length / pageSize) - 1);
  }, [filteredAndSortedSets]);

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
          <Link href="/sets/add">
            <Plus size={16} /> <span className="ml-2">Add New</span>
          </Link>
        </Button>
      </div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-full"
              role="button"
              tabIndex={0}
              onClick={() =>
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
              }
            >
              <div className="flex w-full items-center justify-between">
                Set Name
                {sortOrder === "asc" ? (
                  <ArrowUpNarrowWide size={16} />
                ) : (
                  <ArrowDownNarrowWide size={16} />
                )}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedSets.length ? (
            filteredAndSortedSets
              .slice(
                Math.min(
                  currentPage * pageSize,
                  Math.max(filteredAndSortedSets.length - 1, 0),
                ),
                Math.min(
                  (currentPage + 1) * pageSize,
                  filteredAndSortedSets.length + pageSize - 1,
                ),
              )
              .map((set) => (
                <TableRow
                  key={set.name}
                  role="link"
                  onClick={() => {
                    router.push(`/sets/${encodeURIComponent(set.name)}`, {
                      scroll: false,
                    });
                  }}
                  className="cursor-pointer"
                  tabIndex={0}
                >
                  <TableCell className="flex items-center gap-4">
                    <Image
                      src={set.thumbnail}
                      alt={set.name}
                      width={40}
                      height={40}
                      className="aspect-square object-scale-down"
                    />
                    {set.name}
                  </TableCell>
                </TableRow>
              ))
          ) : (
            <TableRow className="hover:bg-background">
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                No Sets Found
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
