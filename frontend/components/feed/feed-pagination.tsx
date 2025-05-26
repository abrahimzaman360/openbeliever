import { ReadonlyURLSearchParams, useRouter } from "next/navigation";
import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

export default function FeedPagination({
  currentPage,
  searchParams,
  totalPages,
}: {
  currentPage: number;
  searchParams: ReadonlyURLSearchParams;
  totalPages: number;
}) {
  const router = useRouter();

  // Pagination Methods:
  const createQueryString = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    return params.toString();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center mt-2 py-2 border-none pt-3 gap-y-1 gap-x-4">
      <div className="flex flex-row items-center justify-between space-x-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  router.push(`?${createQueryString(currentPage - 1)}`)
                }
                aria-disabled={currentPage === 1}
                className={
                  currentPage <= 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() => router.push(`?${createQueryString(1)}`)}>
                  1
                </PaginationLink>
              </PaginationItem>
            )}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`?${createQueryString(currentPage - 1)}`)
                  }>
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink className="cursor-pointer" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`?${createQueryString(currentPage + 1)}`)
                  }>
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            {currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(`?${createQueryString(totalPages)}`)
                  }>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  router.push(`?${createQueryString(currentPage + 1)}`)
                }
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
