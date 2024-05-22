import { Button } from "@/components/ui/button";
import { Stat } from "@prisma/client";
import { Plus, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server";
import { MultiSelectDialog } from "@/components/multi-select";

type StatWithType = Stat & {
  type: string;
};

type Props = {
  allTypes: inferRouterOutputs<AppRouter>["type"]["getAllTypesExcludingFixed"];
  selectedMainStats: StatWithType[];
  setSelectedMainStats: Dispatch<SetStateAction<StatWithType[]>>;
};

export default function SelectMainStats({
  allTypes,
  selectedMainStats,
  setSelectedMainStats,
}: Props) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium leading-none">Main Stats</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-36 px-2">Relic Type</TableHead>
            <TableHead>Main Stats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allTypes.map((type) => {
            const options = type.stats.filter(
              (stat) =>
                !selectedMainStats.find(
                  (selected) =>
                    selected.name === stat.name && selected.type === type.name,
                ),
            );
            return (
              <TableRow key={type.name}>
                <TableCell className="px-2">{type.name}</TableCell>
                <TableCell className="flex flex-wrap gap-2">
                  {selectedMainStats
                    .filter((stat) => stat.type === type.name)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((stat) => (
                      <Button
                        key={stat.name}
                        className="min-w-36 justify-between gap-6"
                        type="button"
                        onClick={() => {
                          const filtered = selectedMainStats.filter(
                            (selected) =>
                              !(
                                selected.name === stat.name &&
                                stat.type === selected.type
                              ),
                          );
                          setSelectedMainStats(filtered);
                        }}
                      >
                        <div className="flex items-center">
                          <Image
                            src={stat.thumbnail}
                            alt={stat.name}
                            height={24}
                            width={24}
                            className="mr-1 aspect-square object-cover invert"
                          />
                          <span>{stat.name}</span>
                        </div>
                        <X size={16} />
                      </Button>
                    ))}
                  {options.length > 0 && (
                    <MultiSelectDialog
                      allItems={options.map((stat) => ({
                        name: stat.name,
                        thumbnail: stat.thumbnail,
                      }))}
                      addNewItems={(items) => {
                        const newMainStats: typeof selectedMainStats = [];
                        for (const item of items) {
                          const found = type.stats.find(
                            (stat) => stat.name === item.name,
                          );
                          if (found)
                            newMainStats.push({
                              ...found,
                              type: type.name,
                            });
                        }
                        setSelectedMainStats([
                          ...selectedMainStats,
                          ...newMainStats,
                        ]);
                      }}
                      dialogTriggerNode={
                        <Button
                          className="min-w-36"
                          type="button"
                          variant="outline"
                        >
                          <div className="flex items-center gap-2">
                            <Plus size={16} />
                            <span>Add {type.name} Main Stat</span>
                          </div>
                        </Button>
                      }
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
