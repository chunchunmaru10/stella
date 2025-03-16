import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParsedPrydwenCharacter } from "@/lib/types";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ThumbnailInput from "@/components/thumbnail-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Star } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, formatZodError } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { api } from "@/trpc/client";
import { toast } from "@/components/ui/use-toast";

export default function NewCharacterCard({
  newCharacter,
  removeCharacter,
}: {
  newCharacter: ParsedPrydwenCharacter;
  removeCharacter: () => void;
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [rarity, setRarity] = useState(5);
  const [releaseDate, setReleaseDate] = useState<Date>();
  const { mutate: addCharacter, isPending } =
    api.character.addCharacter.useMutation({
      onSuccess: () => {
        toast({
          description: `${newCharacter.name} added successfully.`,
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          {thumbnailUrl && (
            <Image
              src={thumbnailUrl}
              alt={newCharacter.name}
              className="mr-6 h-auto w-auto rounded-full"
              width={36}
              height={36}
            />
          )}
          <div className="ml-2 flex min-w-0 flex-wrap items-center gap-2">
            <CardTitle className="min-w-0 break-words text-lg font-semibold">
              {newCharacter.name}
            </CardTitle>
            <div className="min-w-0 max-w-full break-words">
              (
              <Link
                href={"https://www.prydwen.gg" + newCharacter.link}
                target="_blank"
                className="hover:underline"
              >
                {newCharacter.link}
              </Link>
              )
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ThumbnailInput
          thumbnailUrl={thumbnailUrl}
          setThumbnailUrl={setThumbnailUrl}
          thumbnailText={newCharacter.name}
        />
        <div className="mt-4 flex flex-col gap-4 md:flex-row">
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
        <div className="mt-4 flex flex-wrap gap-8">
          <div>
            <p>Sets: </p>
            <ul className="ml-4 list-inside list-disc">
              {newCharacter.sets.map((set) => (
                <li key={set}>{set}</li>
              ))}
            </ul>
          </div>
          <div>
            <p>Main Stats: </p>
            <ul className="ml-4 list-inside list-disc">
              {Object.keys(newCharacter.mainStats).map((slot) => (
                <li key={slot}>
                  {slot}
                  <ul className="ml-4 list-inside list-disc">
                    {newCharacter.mainStats[
                      slot as keyof typeof newCharacter.mainStats
                    ].map((stat) => (
                      <li key={stat}>{stat}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p>Substats: </p>
            <ul className="ml-4 list-inside list-disc">
              {newCharacter.substats.map((stats, i) => (
                <li key={i}>
                  Priority {i + 1}
                  <ul className="ml-4 list-inside list-disc">
                    {stats.map((stat) => (
                      <li key={stat}>{stat}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button
          className="mt-4 w-full"
          onClick={() => {
            if (!thumbnailUrl) {
              toast({
                description: "Thumbnail URL is required.",
                variant: "destructive",
              });
              return;
            }

            if (!releaseDate) {
              toast({
                description: "Release date is required.",
                variant: "destructive",
              });
              return;
            }

            addCharacter({
              name: newCharacter.name,
              thumbnail: thumbnailUrl,
              rarity,
              releaseDate,
              sets: newCharacter.sets,
              mainStats: Object.keys(newCharacter.mainStats)
                .map((slot) =>
                  newCharacter.mainStats[
                    slot as keyof typeof newCharacter.mainStats
                  ].map((stat) => ({
                    type: slot,
                    stat,
                  })),
                )
                .flat(),
              subStats: newCharacter.substats
                .map((stats, i) =>
                  stats.map((stat) => ({
                    priority: i + 1,
                    stat,
                  })),
                )
                .flat(),
            });
          }}
          isLoading={isPending}
        >
          Add
        </Button>
      </CardContent>
    </Card>
  );
}
