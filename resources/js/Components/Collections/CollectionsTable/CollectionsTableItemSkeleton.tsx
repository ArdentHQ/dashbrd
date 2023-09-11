import React, { useMemo } from "react";
import { Skeleton } from "@/Components/Skeleton";
import { TableCell, TableRow } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const CollectionsTableItemSkeleton = ({
    index,
    disabled,
}: {
    index: number;
    disabled: boolean;
}): JSX.Element => {
    const { isMdAndAbove, isLgAndAbove, isXlAndAbove } = useBreakpoint();

    const nftsToShow = useMemo((): number => {
        if (isXlAndAbove) {
            return 4;
        }

        if (isLgAndAbove) {
            return 2;
        }

        return 1;
    }, [isXlAndAbove, isLgAndAbove]);

    return (
        <TableRow
            data-index={index}
            key={index}
            borderClass=""
            className="group cursor-pointer"
        >
            <TableCell
                variant="start-list"
                innerClassName="py-4"
                paddingClassName="px-2 md:px-5 flex w-full items-center space-x-4"
                hoverClassName=""
            >
                <Skeleton
                    isCircle
                    className="relative h-8 w-8 shrink-0 md:h-20 md:w-20"
                    disabled={disabled}
                />

                <Skeleton
                    className="h-4 w-28"
                    disabled={disabled}
                />
            </TableCell>

            {isLgAndAbove && (
                <TableCell
                    innerClassName="justify-end"
                    paddingClassName="px-2 md:px-5"
                    hoverClassName=""
                >
                    <div className="mt-1 flex flex-col items-end space-y-2">
                        <Skeleton
                            className="h-4 w-16"
                            disabled={disabled}
                        />
                        <Skeleton
                            className="h-4 w-24"
                            disabled={disabled}
                        />
                    </div>
                </TableCell>
            )}

            <TableCell
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                <div className="mt-1 flex flex-col items-end space-y-2">
                    <Skeleton
                        className="h-4 w-12"
                        disabled={disabled}
                    />
                    <Skeleton
                        className="h-4 w-20"
                        disabled={disabled}
                    />
                </div>
            </TableCell>

            {isLgAndAbove && (
                <TableCell
                    className="end-cell-until-md"
                    innerClassName="justify-end"
                    paddingClassName="px-2 md:px-5"
                    hoverClassName=""
                >
                    <Skeleton
                        className="mr-2 h-5 w-5"
                        isCircle
                        disabled={disabled}
                    />
                </TableCell>
            )}

            {isMdAndAbove && (
                <TableCell
                    variant="end-list"
                    paddingClassName="px-2 md:px-5"
                    hoverClassName=""
                >
                    <div className="flex items-center space-x-2">
                        {Array.from({ length: nftsToShow })
                            .fill({})
                            .map((_, key) => (
                                <Skeleton
                                    key={key}
                                    className="h-20 w-20"
                                    disabled={disabled}
                                />
                            ))}
                    </div>
                </TableCell>
            )}

            <TableCell
                variant="end-list"
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                <Skeleton
                    className="h-6 w-6 md:mt-0 md:h-10 md:w-10"
                    isCircle
                    disabled={disabled}
                />
            </TableCell>
        </TableRow>
    );
};
