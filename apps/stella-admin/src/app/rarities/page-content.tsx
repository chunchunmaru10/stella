"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Rarity } from "database";
import { useMemo, useState } from "react";
import TableCellInput from "@/components/table-cell-input";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/trpc/client";
import { formatZodError } from "@/lib/utils";

export default function RarityPageContent({
  allRarities,
}: {
  allRarities: Rarity[];
}) {
  const [rarities, setRarities] = useState(allRarities);
  const hasChanged = useMemo(() => {
    if (rarities.length !== allRarities.length) return true;

    return getDifference().length > 0;
  }, [rarities, allRarities]);
  const { isLoading, mutate } = api.rarity.updateRarity.useMutation({
    onSuccess: () => {
      toast({
        description: "Changes saved",
      });
    },
    onError: (e) => {
      let message = e.message;
      const zodError = formatZodError(e.data?.zodError);

      if (zodError) message = zodError;

      toast({
        description: message,
        variant: "destructive",
      });
    },
  });

  function getDifference() {
    let different: Rarity[] = [];
    const sortedRarities = rarities.toSorted((a, b) => a.rarity - b.rarity);
    const sortedAllRarities = allRarities.toSorted(
      (a, b) => a.rarity - b.rarity,
    );

    for (let i = 0; i < sortedRarities.length; i++) {
      const rarity = sortedRarities[i];
      const originalRarity = sortedAllRarities[i];

      if (
        rarity.rarity !== originalRarity.rarity ||
        rarity.maxLevel !== originalRarity.maxLevel ||
        rarity.baseSubstatAmount !== originalRarity.baseSubstatAmount ||
        rarity.maxSubstatAmount !== originalRarity.maxSubstatAmount
      )
        different.push(rarity);
    }

    return different;
  }

  return (
    <>
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold">Rarities</h1>
        <Button
          disabled={!hasChanged}
          isLoading={isLoading}
          onClick={() => mutate(getDifference())}
        >
          <Save size={20} />
          <span className="ml-2 hidden md:block">Save Changes</span>
        </Button>
      </div>
      <Table className="mt-2">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Rarity</TableHead>
            <TableHead className="text-center">Max Level</TableHead>
            <TableHead className="text-center">Base Substat Amount</TableHead>
            <TableHead className="text-center">Max Substat Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rarities
            .sort((a, b) => a.rarity - b.rarity)
            .map((rarity, i) => (
              <TableRow key={rarity.rarity}>
                <TableCell className="text-center">{rarity.rarity}</TableCell>
                <TableCellInput
                  value={rarity.maxLevel}
                  label="Rarity"
                  onValueChange={(newValue) => {
                    if (!newValue) {
                      toast({
                        description: "Max level is required",
                        variant: "destructive",
                      });
                      return;
                    }

                    const newRarities = rarities.toSorted(
                      (a, b) => a.rarity - b.rarity,
                    );

                    newRarities[i] = {
                      ...newRarities[i],
                      maxLevel: newValue,
                    };
                    setRarities(newRarities);
                  }}
                />
                <TableCellInput
                  value={rarity.baseSubstatAmount}
                  label="Base Substat Amount"
                  onValueChange={(newValue) => {
                    if (newValue === undefined) {
                      toast({
                        description: "Base substat amount is required",
                        variant: "destructive",
                      });
                      return;
                    }

                    const newRarities = rarities.toSorted(
                      (a, b) => a.rarity - b.rarity,
                    );

                    newRarities[i] = {
                      ...newRarities[i],
                      baseSubstatAmount: newValue,
                    };
                    setRarities(newRarities);
                  }}
                />
                <TableCellInput
                  value={rarity.maxSubstatAmount}
                  label="Max Substat Amount"
                  onValueChange={(newValue) => {
                    if (newValue === undefined) {
                      toast({
                        description: "Max substat amount is required",
                        variant: "destructive",
                      });
                      return;
                    }

                    const newRarities = rarities.toSorted(
                      (a, b) => a.rarity - b.rarity,
                    );

                    newRarities[i] = {
                      ...newRarities[i],
                      maxSubstatAmount: newValue,
                    };
                    setRarities(newRarities);
                  }}
                />
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
}
