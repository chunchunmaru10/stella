"use client";

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
import { MultiSelectDialog } from "@/components/multi-select";

type StatWithPriority = Stat & {
  priority: number;
};

type Props = {
  allSubstats: Stat[];
  selectedSubstats: StatWithPriority[];
  setSelectedSubstats: Dispatch<SetStateAction<StatWithPriority[]>>;
};

export default function SelectSubstats({
  allSubstats,
  selectedSubstats,
  setSelectedSubstats,
}: Props) {
  const priorities = getPrioritiesArray();

  function getPrioritiesArray(): number[] {
    if (!selectedSubstats.length) return [1];

    let maxPriority = Math.max(
      ...selectedSubstats.map((stat) => stat.priority),
    );

    const arr: number[] = [];

    if (allSubstats.length > 0) maxPriority++;

    for (let i = 1; i <= maxPriority; i++) {
      arr.push(i);
    }

    return arr;
  }

  function removeSubstatFromSelected(toBeRemoved: StatWithPriority) {
    const filtered = selectedSubstats.filter(
      (selected) => selected.name !== toBeRemoved.name,
    );

    // check if filtered still contains other substats with the same priority, if yes, do nothing
    // else need to shift every priority after that up so that there will not be a gap between two priorities

    if (filtered.find((stat) => stat.priority === toBeRemoved.priority))
      return filtered;

    const sorted = filtered.sort((a, b) => a.priority - b.priority);
    for (const stat of sorted) {
      if (stat.priority > toBeRemoved.priority) stat.priority -= 1;
    }

    return sorted;
  }

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium leading-none">Substats</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Priority</TableHead>
            <TableHead>Substats</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {priorities.map((priority) => {
            const options = allSubstats.filter(
              (stat) =>
                !selectedSubstats.find(
                  (selected) => selected.name === stat.name,
                ),
            );
            return (
              <TableRow key={priority}>
                <TableCell>{priority}</TableCell>
                <TableCell className="flex flex-wrap gap-2">
                  {selectedSubstats
                    .filter((stat) => stat.priority === priority)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((stat) => (
                      <Button
                        key={stat.name}
                        className="min-w-36 justify-between gap-6"
                        type="button"
                        onClick={() => {
                          setSelectedSubstats(removeSubstatFromSelected(stat));
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
                        const newSubstats: StatWithPriority[] = [];
                        const oldSubstats = selectedSubstats.filter(
                          (stat) => stat.priority !== priority,
                        ); // remove all old substats with this priority and readd them back in
                        for (const item of items) {
                          const found = allSubstats.find(
                            (all) => all.name === item.name,
                          );

                          if (found)
                            newSubstats.push({
                              ...found,
                              priority,
                            });
                        }
                        setSelectedSubstats([...oldSubstats, ...newSubstats]);
                      }}
                      dialogTriggerNode={
                        <Button
                          className="min-w-36"
                          type="button"
                          variant="outline"
                        >
                          <div className="flex items-center gap-2">
                            <Plus size={16} />
                            <span>Add Substat</span>
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
