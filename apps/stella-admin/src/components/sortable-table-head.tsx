import React, { Dispatch, SetStateAction } from "react";
import { TableHead } from "./ui/table";
import { ArrowDownNarrowWide, ArrowUpNarrowWide } from "lucide-react";

type SortBy = {
  key: string;
  order: "asc" | "desc";
};

type Props = React.ComponentProps<typeof TableHead> & {
  sortBy: SortBy;
  setSortBy: Dispatch<SetStateAction<SortBy>>;
  columnName: string;
};

export default function SortableTableHead({
  className,
  children,
  sortBy,
  setSortBy,
  columnName,
  ...restProps
}: Props) {
  function changeSort(colName: string) {
    let newSortBy: typeof sortBy;
    if (sortBy.key !== colName)
      newSortBy = {
        key: colName,
        order: "asc",
      };
    else
      newSortBy = {
        key: colName,
        order: sortBy.order === "asc" ? "desc" : "asc",
      };

    setSortBy(newSortBy);
  }

  return (
    <TableHead
      className={className}
      role="button"
      tabIndex={1}
      onClick={() => changeSort(columnName)}
      {...restProps}
    >
      <div className="flex w-full items-center justify-between text-center">
        {children ?? columnName}
        {sortBy.key === columnName ? (
          sortBy.order === "asc" ? (
            <ArrowUpNarrowWide size={16} />
          ) : (
            <ArrowDownNarrowWide size={16} />
          )
        ) : null}
      </div>
    </TableHead>
  );
}
