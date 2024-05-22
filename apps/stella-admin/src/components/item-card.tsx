import { X } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { MouseEventHandler } from "react";
import Image from "next/image";

type Props = {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  item: {
    name: string;
    thumbnail: string;
  };
  showClose?: boolean;
  active?: boolean;
};

export default function ItemCard({
  onClick,
  item,
  showClose = true,
  active = false,
}: Props) {
  return (
    <button className="w-full max-w-full" onClick={onClick}>
      <Card
        className={`w-full ${active ? "border-primary bg-primary-foreground" : ""}`}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <Image
            src={item.thumbnail}
            alt="Character Thumbnail Preview"
            width={48}
            height={48}
            className="aspect-square object-cover"
          />
          <div className="ml-4 flex w-full min-w-0 items-center justify-between">
            <h3 className="w-full truncate text-left text-lg font-semibold">
              {item.name}
            </h3>
            {showClose && <X className="text-red-500" size={24} />}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
