import React, { useMemo } from "react";
import { Skeleton } from "@/Components/Skeleton";
import { TableCell, TableRow } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { range } from "@/utils/range";

export const CollectionsTableItemSkeleton = ({
    index,
    animated,
}: {
    index: number;
    animated: boolean;
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
                    animated={animated}
                />

                <Skeleton
                    className="h-4 w-28"
                    animated={animated}
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
                            animated={animated}
                        />
                        <Skeleton
                            className="h-4 w-24"
                            animated={animated}
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
                        animated={animated}
                    />
                    <Skeleton
                        className="h-4 w-20"
                        animated={animated}
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
                        animated={animated}
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
                        {range(nftsToShow).map((index_) => (
                            <Skeleton
                                key={index_}
                                className="h-20 w-20"
                                animated={animated}
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
                    animated={animated}
                />
            </TableCell>
        </TableRow>
    );
};
