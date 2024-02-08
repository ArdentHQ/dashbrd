import { router } from "@inertiajs/react";
import React, { useRef } from "react";
import {
    PopularCollectionFloorPrice,
    PopularCollectionName,
    PopularCollectionVolume,
} from "./PopularCollectionsTable.blocks";
import { type PopularCollectionTableItemProperties } from "./PopularCollectionsTable.contract";
import { Skeleton } from "@/Components/Skeleton";
import { TableCell, TableRow } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const PopularCollectionsTableItem = ({
    collection,
    uniqueKey,
    user,
}: PopularCollectionTableItemProperties): JSX.Element => {
    const reference = useRef(null);

    return (
        <TableRow
            ref={reference}
            key={uniqueKey}
            borderClass=""
            className="group cursor-pointer dark:border-theme-dark-700"
            onClick={() => {
                router.visit(
                    route("collections.view", {
                        slug: collection.slug,
                    }),
                );
            }}
        >
            <TableCell
                variant="start-list"
                innerClassName="py-4"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
                className="unique-cell-until-md-lg"
            >
                <PopularCollectionName collection={collection} />
            </TableCell>

            <TableCell
                className="hidden xl:table-cell"
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                <PopularCollectionFloorPrice collection={collection} />
            </TableCell>

            <TableCell
                className="hidden md-lg:table-cell"
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                <PopularCollectionVolume
                    collection={collection}
                    user={user}
                />
            </TableCell>
        </TableRow>
    );
};

export const PopularCollectionsTableItemSkeleton = ({ index }: { index: number }): JSX.Element => {
    const { isLgAndAbove, isXlAndAbove } = useBreakpoint();

    return (
        <TableRow
            data-index={index}
            borderClass=""
            data-testid="PopularCollectionsTableItemSkeleton"
        >
            <TableCell
                variant="start-list"
                innerClassName="py-4"
                paddingClassName="px-2 md:px-5 flex w-full items-center space-x-4"
            >
                <Skeleton
                    isCircle
                    className="relative h-8 w-8 shrink-0 md:h-12 md:w-12"
                    animated
                />

                <span className="flex flex-col justify-center space-y-2">
                    <Skeleton
                        className="h-5 w-32"
                        animated
                    />

                    {!isLgAndAbove && (
                        <Skeleton
                            className="h-4 w-20"
                            animated
                        />
                    )}
                </span>
            </TableCell>

            {isLgAndAbove && (
                <TableCell
                    innerClassName="justify-end"
                    paddingClassName="px-2 md:px-5"
                >
                    <div className="mt-1 flex flex-col items-end space-y-2">
                        <Skeleton
                            className="h-4 w-16"
                            animated
                        />
                        <Skeleton
                            className="h-4 w-24"
                            animated
                        />
                    </div>
                </TableCell>
            )}

            {isXlAndAbove && (
                <TableCell
                    innerClassName="justify-end"
                    paddingClassName="px-2 md:px-5"
                >
                    <div className="mt-1 flex flex-col items-end space-y-2">
                        <Skeleton
                            className="h-4 w-12"
                            animated
                        />
                        <Skeleton
                            className="h-4 w-20"
                            animated
                        />
                    </div>
                </TableCell>
            )}
        </TableRow>
    );
};
