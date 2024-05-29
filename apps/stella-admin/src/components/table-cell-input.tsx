"use client";

import { ComponentProps, useState } from "react";
import { TableCell } from "./ui/table";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { InputWithLabel } from "./ui/input";

type Props = {
  value?: number;
  label: string;
  onValueChange: (newValue?: number) => void;
  resetAfterChange?: boolean;
} & ComponentProps<typeof TableCell>;

export default function TableCellInput({
  className,
  value,
  label,
  onValueChange,
  resetAfterChange = false,
  ...restProps
}: Props) {
  const [inputValue, setInputValue] = useState<number | undefined>(value);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(o) => {
        if (!o) onValueChange(inputValue);
        setDialogOpen(o);
        if (resetAfterChange) setInputValue(undefined);
      }}
    >
      <DialogTrigger asChild>
        <TableCell
          className={cn(
            "rounded-md text-center hover:border hover:border-white hover:border-opacity-30",
            className,
          )}
          role="button"
          {...restProps}
        >
          {value}
        </TableCell>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onValueChange(inputValue);
            setDialogOpen(false);
            if (resetAfterChange) setInputValue(undefined);
          }}
        >
          <InputWithLabel
            type="number"
            label={label}
            value={inputValue ?? ""}
            onChange={(e) =>
              setInputValue(
                e.target.value ? Number.parseFloat(e.target.value) : undefined,
              )
            }
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
