import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InputWithLabel } from "@/components/ui/input";
import { Piece, Type } from "@prisma/client";
import { Dispatch, FormEventHandler, SetStateAction, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function SelectPiece({
  piece,
  setPieces,
  type,
}: {
  piece?: Piece;
  setPieces: Dispatch<SetStateAction<Piece[]>>;
  type: Type;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pieceName, setPieceName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [error, setError] = useState({
    name: "",
    thumbnailUrl: "",
  });

  const addPiece: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    let hasError = false;
    setError({
      name: "",
      thumbnailUrl: "",
    });

    if (!pieceName.trim()) {
      setError({
        ...error,
        name: "Name is required",
      });
      hasError = true;
    }

    if (!thumbnailUrl.trim()) {
      setError({
        ...error,
        thumbnailUrl: "Thumbnail is required",
      });
      hasError = true;
    } else if (!URL.canParse(thumbnailUrl)) {
      setError({
        ...error,
        thumbnailUrl: "Invalid Thumbnail URL",
      });
      hasError = true;
    }

    if (hasError) return;

    setPieces((prev) => [
      ...prev,
      {
        name: pieceName,
        thumbnail: thumbnailUrl,
        typeName: type.name,
        setName: "",
      },
    ]);
    setPieceName("");
    setThumbnailUrl("");
    setDialogOpen(false);
  };

  return (
    <Card>
      {piece ? (
        <button
          className="flex h-full w-full items-center justify-between p-4"
          type="button"
          onClick={() =>
            setPieces((prev) => prev.filter((p) => p.typeName !== type.name))
          }
        >
          <div className="flex items-center gap-4">
            <Image
              src={piece.thumbnail}
              alt={piece.name}
              width={56}
              height={56}
              className="aspect-square h-14 w-14 rounded-full object-cover"
            />
            <span className="font-semibold">{piece.name}</span>
          </div>
          <X className="text-red-500" />
        </button>
      ) : (
        <CardContent className="flex h-full items-center justify-center p-4">
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => setDialogOpen(open)}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Image
                  src={type.thumbnail}
                  alt={type.name}
                  width={24}
                  height={24}
                  className="invert"
                />
                Add {type.name}
              </Button>
            </DialogTrigger>
            <DialogContent asChild>
              <form onSubmit={addPiece}>
                <DialogHeader>
                  <DialogTitle>Add {type.name}</DialogTitle>
                </DialogHeader>
                <InputWithLabel
                  label="Piece Name"
                  value={pieceName}
                  onChange={(e) => setPieceName(e.target.value)}
                  error={error.name}
                />
                <InputWithLabel
                  label="Thumbnail"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  error={error.thumbnailUrl}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setError({
                        name: "",
                        thumbnailUrl: "",
                      });
                      setPieceName("");
                      setThumbnailUrl("");
                      setDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button>Add {type.name}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      )}
    </Card>
  );
}
