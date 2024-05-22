import React, { Dispatch, SetStateAction } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "./ui/pagination";

type Props = {
  maxPage: number;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
};

export default function PaginationFull({
  maxPage,
  currentPage,
  setCurrentPage,
}: Props) {
  const pages = getPages();

  function getPages() {
    const pages: (number | undefined)[] = [];

    for (
      let i = Math.max(0, currentPage - 2);
      i <= Math.min(maxPage, currentPage + 2);
      i++
    ) {
      pages.push(i);
    }

    if (!pages.includes(0)) {
      if (pages[0] !== 1) pages.unshift(undefined);
      pages.unshift(0);
    }

    if (!pages.includes(maxPage)) {
      if (pages[-1] !== maxPage - 1) pages.push(undefined);
      pages.push(maxPage);
    }

    return pages;
  }

  return maxPage > 0 ? (
    <Pagination>
      <PaginationContent className="my-6">
        {pages.map((page) => (
          <PaginationItem key={page ?? crypto.randomUUID()}>
            {page === undefined ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={currentPage === page}
                onClick={() => setCurrentPage(page)}
              >
                {page + 1}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
      </PaginationContent>
    </Pagination>
  ) : null;
}
