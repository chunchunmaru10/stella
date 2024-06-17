"use client";

import PaginationFull from "@/components/pagination-full";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next-nprogress-bar";
import { Input } from "@/components/ui/input";
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Check,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/server";
import SortableTableHead from "@/components/sortable-table-head";

export default function StatList({
  allStats,
}: {
  allStats: inferRouterOutputs<AppRouter>["stat"]["getAllStats"];
}) {
  const pageSize = 7;

  const [currentPage, setCurrentPage] = useState(0);
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState<{
    key: string;
    order: "asc" | "desc";
  }>({
    key: "Sort Order",
    order: "asc",
  });
  const filteredAndSortedStats = useMemo(
    () =>
      allStats
        .filter((s) =>
          s.name.toLocaleLowerCase().replace(" ", "").includes(filterText),
        )
        .sort((a, b) => {
          const smaller = sortBy.order === "asc" ? a : b;
          const bigger = sortBy.order === "asc" ? b : a;

          switch (sortBy.key) {
            case "Name":
              return smaller.name.localeCompare(bigger.name);
            case "Can Be Main Stat":
              return (
                bigger.mainStatScalings.length - smaller.mainStatScalings.length
              );
            case "Can Be Substat":
              return (
                bigger.subStatScalings.length - smaller.subStatScalings.length
              );
            case "Show Percentage":
              return (
                Number(bigger.displayPercentage) -
                Number(smaller.displayPercentage)
              );
            default:
              return smaller.sortOrder - bigger.sortOrder;
          }
        }),
    [sortBy, filterText, allStats],
  );
  const router = useRouter();

  const maxPage = useMemo(() => {
    return Math.max(0, Math.ceil(filteredAndSortedStats.length / pageSize) - 1);
  }, [filteredAndSortedStats]);

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
          <Link href="/stats/add">
            <Plus size={16} /> <span className="ml-2">Add New</span>
          </Link>
        </Button>
      </div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <SortableTableHead
              columnName="Name"
              className="w-2/3 min-w-64"
              sortBy={sortBy}
              setSortBy={setSortBy}
            />
            {[
              "Can Be Main Stat",
              "Can Be Substat",
              "Show Percentage",
              "Sort Order",
            ].map((th) => (
              <SortableTableHead
                key={th}
                className="min-w-44"
                columnName={th}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedStats.length ? (
            filteredAndSortedStats
              .slice(
                Math.min(
                  currentPage * pageSize,
                  Math.max(filteredAndSortedStats.length - 1, 0),
                ),
                Math.min(
                  (currentPage + 1) * pageSize,
                  filteredAndSortedStats.length + pageSize - 1,
                ),
              )
              .map((stat) => (
                <TableRow
                  key={stat.name}
                  role="link"
                  onClick={() => {
                    router.push(`/stats/${encodeURIComponent(stat.name)}`, {
                      scroll: false,
                    });
                  }}
                  className="cursor-pointer"
                  tabIndex={0}
                >
                  <TableCell className="flex items-center gap-4">
                    <Image
                      src={stat.thumbnail}
                      alt={stat.name}
                      width={40}
                      height={40}
                      className="aspect-square object-scale-down"
                    />
                    {stat.name}
                  </TableCell>
                  <TableCell>
                    {stat.mainStatScalings.length > 0 ? <Check /> : <X />}
                  </TableCell>
                  <TableCell>
                    {stat.subStatScalings.length > 0 ? <Check /> : <X />}
                  </TableCell>
                  <TableCell>
                    {stat.displayPercentage ? <Check /> : <X />}
                  </TableCell>
                  <TableCell>{stat.sortOrder}</TableCell>
                </TableRow>
              ))
          ) : (
            <TableRow className="hover:bg-background">
              <TableCell
                colSpan={3}
                className="text-center text-muted-foreground"
              >
                No Stats Found
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
