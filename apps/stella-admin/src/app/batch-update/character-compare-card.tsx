import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CharacterFull, ParsedPrydwenCharacter } from "@/lib/types";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/client";
import { toast } from "@/components/ui/use-toast";
import { formatZodError } from "@/lib/utils";

type Status = "added" | "remain" | "deleted";

export default function CharacterCompareCard({
  existingCharacter,
  removeCharacter,
  willUpdateApply,
  toggle,
}: {
  existingCharacter: ParsedPrydwenCharacter & { old: CharacterFull };
  removeCharacter: () => void;
  willUpdateApply: boolean;
  toggle: () => void;
}) {
  const { mutate: updateSingleCharacter, isPending } =
    api.character.batchEditCharacters.useMutation({
      onSuccess: () => {
        toast({
          description: `${existingCharacter.name} updated successfully.`,
        });
        removeCharacter();
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
  const { updatedSets, updatedMainStats, updatedSubstats } = useMemo(() => {
    // handle sets
    const oldSetsString = existingCharacter.old.sets.map((s) => s.name);
    const updatedSets = Array.from(
      new Set([...existingCharacter.sets, ...oldSetsString]),
    ).map((s) => {
      return {
        name: s,
        status: getStatus(s, existingCharacter.sets, oldSetsString),
      };
    });

    let updatedMainStats: Record<
      keyof typeof existingCharacter.mainStats,
      { name: string; status: Status }[]
    > = {} as Record<
      keyof typeof existingCharacter.mainStats,
      { name: string; status: Status }[]
    >;

    // handle main stats
    for (const slot in existingCharacter.mainStats) {
      const oldMainStatsString = existingCharacter.old.characterMainStats
        .filter((s) => s.typeName === slot)
        .map((s) => s.statName);
      const newMainStats =
        existingCharacter.mainStats[
          slot as keyof typeof existingCharacter.mainStats
        ];

      const uniqueMainStats = Array.from(
        new Set([...newMainStats, ...oldMainStatsString]),
      ).map((s) => {
        return {
          name: s,
          status: getStatus(s, newMainStats, oldMainStatsString),
        };
      });

      updatedMainStats[slot as keyof typeof existingCharacter.mainStats] =
        uniqueMainStats;
    }

    const updatedSubstats: {
      priority: number;
      substats: { name: string; status: Status }[];
      status: Status;
    }[] = [];

    // handle substats
    for (let i = 0; i < existingCharacter.substats.length; i++) {
      const priorityLevel = i + 1;
      const newSubstats = existingCharacter.substats[i];
      const oldSubstats = existingCharacter.old.characterSubstats
        .filter((s) => s.priority === priorityLevel)
        .map((s) => s.statName);
      const unique = Array.from(new Set([...newSubstats, ...oldSubstats]));

      updatedSubstats.push({
        priority: priorityLevel,
        substats: unique.map((stat) => {
          return {
            name: stat,
            status: getStatus(stat, newSubstats, oldSubstats),
          };
        }),
        status: existingCharacter.old.characterSubstats.find(
          (s) => s.priority === priorityLevel,
        )
          ? "remain"
          : "added",
      });
    }

    // check if has deleted priority
    const maxOldPriority = Math.max(
      ...existingCharacter.old.characterSubstats.map((s) => s.priority),
    );

    if (maxOldPriority > existingCharacter.substats.length) {
      for (
        let i = existingCharacter.substats.length + 1;
        i <= maxOldPriority;
        i++
      ) {
        updatedSubstats.push({
          priority: i,
          substats: existingCharacter.old.characterSubstats
            .filter((s) => s.priority === i)
            .map((s) => ({
              name: s.statName,
              status: "deleted",
            })),
          status: "deleted",
        });
      }
    }

    return { updatedSets, updatedMainStats, updatedSubstats };
  }, [existingCharacter]);

  function getStatus(
    s: string,
    newArray: string[],
    oldArray: string[],
  ): Status {
    const newInclude = newArray.includes(s);
    const oldInclude = oldArray.includes(s);

    if (newInclude && oldInclude) {
      return "remain";
    } else if (newInclude) {
      return "added";
    } else {
      return "deleted";
    }
  }

  function getTextColor(status: Status) {
    switch (status) {
      case "added":
        return "text-green-500";
      case "deleted":
        return "text-red-500";
      default:
        return "text-primary";
    }
  }

  function getIcon(status: Status) {
    switch (status) {
      case "added":
        return <Plus width={16} height={16} />;
      case "deleted":
        return <Minus width={16} height={16} />;
      default:
        return (
          <div className="flex h-4 w-4 items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="8"
              height="8"
              fill="currentColor"
              className="bi bi-circle-fill"
              viewBox="0 0 16 16"
            >
              <circle cx="5" cy="5" r="5" />
            </svg>
          </div>
        );
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center">
          <Image
            src={existingCharacter.old.thumbnail}
            alt={existingCharacter.name}
            className="mr-6 h-auto w-auto rounded-full"
            width={36}
            height={36}
          />
          <div className="ml-2 flex min-w-0 flex-wrap items-center gap-2">
            <CardTitle className="min-w-0 break-words text-lg font-semibold">
              {existingCharacter.name}
            </CardTitle>
            <div className="min-w-0 max-w-full break-words">
              (
              <Link
                href={"https://www.prydwen.gg" + existingCharacter.link}
                target="_blank"
                className="hover:underline"
              >
                {existingCharacter.link}
              </Link>
              )
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-8">
        <div className="flex flex-wrap gap-8">
          <div>
            <p>Updated Sets: </p>
            <ul>
              {updatedSets.map((set) => (
                <li
                  key={set.name}
                  className={`${getTextColor(set.status)} flex items-center gap-2`}
                >
                  {getIcon(set.status)}
                  <span>{set.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p>Updated Main Stats:</p>
            <ul className="list-inside list-disc">
              {Object.keys(updatedMainStats).map((type) => (
                <li key={type}>
                  {type}
                  <ul className="ml-4">
                    {updatedMainStats[
                      type as keyof typeof updatedMainStats
                    ].map((stat) => (
                      <li
                        key={stat.name}
                        className={`${getTextColor(stat.status)} flex items-center gap-2`}
                      >
                        {getIcon(stat.status)}
                        <span>{stat.name}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p>Updated Substats:</p>
            <ul>
              {updatedSubstats.map((level) => (
                <li key={level.priority} className={getTextColor(level.status)}>
                  <div className="flex items-center gap-2">
                    {getIcon(level.status)}
                    <span>Priority {level.priority}</span>
                  </div>
                  <ul className="ml-4">
                    {level.substats.map((stat) => (
                      <li
                        key={stat.name}
                        className={`${getTextColor(stat.status)} flex items-center gap-2`}
                      >
                        {getIcon(stat.status)}
                        <span>{stat.name}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex-1" onClick={toggle}>
            {willUpdateApply
              ? "Exclude From Apply List"
              : "Include in Apply List"}
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              updateSingleCharacter([
                {
                  name: existingCharacter.old.name,
                  thumbnail: existingCharacter.old.thumbnail,
                  rarity: existingCharacter.old.rarity,
                  releaseDate: existingCharacter.old.releaseDate,
                  sets: existingCharacter.sets,
                  mainStats: Object.keys(existingCharacter.mainStats)
                    .map((key) =>
                      existingCharacter.mainStats[
                        key as keyof typeof existingCharacter.mainStats
                      ].map((stat) => ({
                        type: key,
                        stat: stat,
                      })),
                    )
                    .flat(),
                  subStats: existingCharacter.substats
                    .map((priority, i) =>
                      priority.map((stat) => ({
                        stat,
                        priority: i + 1,
                      })),
                    )
                    .flat(),
                  originalName: existingCharacter.old.name,
                  lastAutoRun: new Date(),
                },
              ]);
            }}
            isLoading={isPending}
          >
            Update
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
