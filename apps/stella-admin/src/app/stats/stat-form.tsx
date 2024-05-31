"use client";

import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";
import TableCellInput from "@/components/table-cell-input";
import ThumbnailInput from "@/components/thumbnail-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputWithLabel } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { getStatFull } from "@/lib/server/utils";
import { formatZodError } from "@/lib/utils";
import { api } from "@/trpc/client";
import { MainStatScaling, SubstatScaling } from "database";
import { Save, Star } from "lucide-react";
import { useRouter } from "next-nprogress-bar";
import { useMemo, useState } from "react";

type Props = {
  existingStat: Awaited<ReturnType<typeof getStatFull>>;
  allRarities: number[];
};

export default function StatForm({ existingStat, allRarities }: Props) {
  const router = useRouter();
  const [name, setName] = useState(existingStat?.name ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    existingStat?.thumbnail ?? "",
  );
  const [sortOrder, setSortOrder] = useState(existingStat?.sortOrder);
  const [showMainStatTable, setShowMainStatTable] = useState(
    !!existingStat?.mainStatScalings.length,
  );
  const [showSubstatTable, setShowSubstatTable] = useState(
    !!existingStat?.subStatScalings.length,
  );
  const [mainStatScalings, setMainStatScalings] = useState<
    (MainStatScaling & { id: string })[]
  >(
    existingStat?.mainStatScalings.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
    })) ?? [],
  );
  const [substatScalings, setSubstatScalings] = useState<
    (SubstatScaling & { id: string })[]
  >(
    existingStat?.subStatScalings.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
    })) ?? [],
  );
  const substatsTableColumnCount = useMemo(() => {
    const grouped = Object.groupBy(substatScalings, ({ rarityId }) => rarityId);

    let currentMax = 0;

    for (const key in grouped) {
      const value = grouped[key];
      if (value && value.length > currentMax) currentMax = value.length;
    }

    return currentMax + 1;
  }, [substatScalings]);
  const { mutate: editStat, isLoading: editStatIsLoading } =
    api.stat.editStat.useMutation({
      onSuccess: () => {
        toast({
          variant: "default",
          description: `${existingStat?.name ?? "Set"} edited successfully`,
        });
        router.replace("/stats");
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

  function handleSubstatInputChange(
    value: number | undefined,
    scaling: (typeof substatScalings)[number] | undefined,
    rarity: number,
  ) {
    const index = substatScalings.findIndex((s) => s.id === scaling?.id);
    if (!value && index !== -1) {
      if (index !== -1) {
        substatScalings.splice(index, 1);
        setSubstatScalings([...substatScalings]);
      }
    } else if (value && index !== -1) {
      substatScalings[index].scalingValue = value;
      setSubstatScalings([...substatScalings]);
    } else if (value && index === -1) {
      setSubstatScalings([
        ...substatScalings,
        {
          id: crypto.randomUUID(),
          rarityId: rarity,
          scalingValue: value,
          statName: "",
        },
      ]);
    }
  }

  function startEditStat() {
    try {
      if (!existingStat) throw new Error("Cannot edit this stat");
      if (!name) throw new Error("Name is required");
      if (!thumbnailUrl) throw new Error("Thumbnail is required.");
      if (sortOrder === undefined) throw new Error("Sort order is required");

      editStat({
        name,
        thumbnail: thumbnailUrl,
        sortOrder,
        mainStatScalings: {
          canBeMainStat: showMainStatTable,
          scalings: mainStatScalings,
        },
        subStatScalings: {
          canBeSubstat: showSubstatTable,
          scalings: substatScalings,
        },
        originalName: existingStat.name,
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
          {existingStat ? `Edit Stat` : "Add Stat"}
        </h1>
        <div className="flex items-center gap-4">
          <Button isLoading={editStatIsLoading} onClick={startEditStat}>
            <Save size={20} />
            <span className="ml-2 hidden md:block">Save Changes</span>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card
            className={`flex items-center gap-4 p-4 ${showMainStatTable ? "border-white border-opacity-70" : ""}`}
            onClick={() => setShowMainStatTable((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 p-[2px] ${showMainStatTable ? "border-white" : ""}`}
              role="checkbox"
            >
              <div
                className={`h-full w-full rounded-full bg-white ${showMainStatTable ? "" : "hidden"}`}
              />
            </div>
            <p>Main Stat</p>
          </Card>
          <Card
            className={`flex items-center gap-4 p-4 ${showSubstatTable ? "border-white border-opacity-70" : ""}`}
            onClick={() => setShowSubstatTable((prev) => !prev)}
            role="button"
            tabIndex={0}
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 p-[2px] ${showSubstatTable ? "border-white" : ""}`}
              role="checkbox"
            >
              <div
                className={`h-full w-full rounded-full bg-white ${showSubstatTable ? "" : "hidden"}`}
              />
            </div>
            <p>Substat</p>
          </Card>
        </div>
        {showMainStatTable && (
          <>
            <div className="grid flex-grow items-center gap-1.5">
              <p className="text-sm font-medium leading-none">
                Main Stat Scaling
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-0"></TableHead>
                    <TableHead className="text-center">Base Value</TableHead>
                    <TableHead className="text-center">Scaling</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRarities.map((rarity) => {
                    const matchedScaling = mainStatScalings.find(
                      (s) => s.rarityId === rarity,
                    );
                    return (
                      <TableRow key={rarity}>
                        <TableCell className="inline-flex w-20 items-center gap-1">
                          {rarity} <Star size={16} />
                        </TableCell>
                        <TableCellInput
                          value={matchedScaling?.baseValue}
                          label="Base Value"
                          onValueChange={(newValue) => {
                            const index = mainStatScalings.findIndex(
                              (s) => s.id === matchedScaling?.id,
                            );

                            if (index === -1 && newValue)
                              setMainStatScalings([
                                ...mainStatScalings,
                                {
                                  id: crypto.randomUUID(),
                                  baseValue: newValue,
                                  rarityId: rarity,
                                  scalingValue: 0,
                                  statName: "",
                                },
                              ]);
                            else if (!newValue) {
                              setMainStatScalings(
                                mainStatScalings.filter(
                                  (s) => s.id !== matchedScaling?.id,
                                ),
                              );
                            } else {
                              const found = mainStatScalings[index];
                              found.baseValue = newValue;
                              setMainStatScalings([...mainStatScalings]);
                            }
                          }}
                        />
                        <TableCellInput
                          value={matchedScaling?.scalingValue}
                          label="Scaling Value"
                          onValueChange={(newValue) => {
                            const index = mainStatScalings.findIndex(
                              (s) => s.id === matchedScaling?.id,
                            );

                            if (index === -1 && newValue)
                              setMainStatScalings([
                                ...mainStatScalings,
                                {
                                  id: crypto.randomUUID(),
                                  baseValue: 0,
                                  rarityId: rarity,
                                  scalingValue: newValue,
                                  statName: "",
                                },
                              ]);
                            else if (index !== -1 && !newValue) {
                              if (mainStatScalings[index].baseValue !== 0) {
                                const found = mainStatScalings[index];
                                found.scalingValue = 0;
                                setMainStatScalings([...mainStatScalings]);
                              } else {
                                setMainStatScalings(
                                  mainStatScalings.filter(
                                    (s) => s.id !== matchedScaling?.id,
                                  ),
                                );
                              }
                            } else if (index !== -1 && newValue) {
                              const found = mainStatScalings[index];
                              found.scalingValue = newValue;
                              setMainStatScalings([...mainStatScalings]);
                            }
                          }}
                        />
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        {showSubstatTable && (
          <>
            <div className="grid flex-grow items-center gap-1.5">
              <p className="text-sm font-medium leading-none">
                Substat Scaling
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-0"></TableHead>
                  <TableHead
                    className="text-center"
                    colSpan={substatsTableColumnCount}
                  >
                    Scalings
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRarities.map((rarity) => {
                  const scalingsForThisRarity = substatScalings
                    .filter((s) => s.rarityId === rarity)
                    .sort((a, b) => a.scalingValue - b.scalingValue);
                  return (
                    <TableRow key={rarity}>
                      <TableCell className="inline-flex w-20 items-center gap-1">
                        {rarity} <Star size={16} />
                      </TableCell>
                      {scalingsForThisRarity.map((scaling) => (
                        <TableCellInput
                          key={scaling.id}
                          label="Scaling"
                          value={scaling.scalingValue}
                          onValueChange={(value) =>
                            handleSubstatInputChange(value, scaling, rarity)
                          }
                        />
                      ))}
                      <TableCellInput
                        label="Scaling"
                        colSpan={
                          substatsTableColumnCount -
                          scalingsForThisRarity.length
                        }
                        onValueChange={(value) =>
                          handleSubstatInputChange(value, undefined, rarity)
                        }
                        resetAfterChange
                      />
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </form>
      <div className="h-8" />
    </>
  );
}
