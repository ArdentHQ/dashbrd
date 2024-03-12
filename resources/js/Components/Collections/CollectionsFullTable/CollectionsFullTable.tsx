import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column, type TableState } from "react-table";
import { type CollectionTableProperties } from "./CollectionsFullTable.contracts";
import { CollectionsFullTableItem } from "./CollectionsFullTableItem";
import { Skeleton } from "@/Components/Skeleton";
import { Table, TableCell, TableRow } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { PeriodFilterOptions } from "@/Pages/Collections/Components/CollectionsFilterTabs";
import { type CollectionsSortByOption } from "@/Pages/Collections/Components/CollectionsSortingTabs";
import { range } from "@/utils/range";

export const CollectionsFullTable = ({
    collections,
    user,
    activeSort,
    setSortBy,
    direction,
    activePeriod,
    isLoading,
}: CollectionTableProperties): JSX.Element => {
    const { t } = useTranslation();

    const { isMdAndAbove, isLgAndAbove } = useBreakpoint();

    const initialState = useMemo<Partial<TableState<App.Data.Collections.CollectionData>>>(
        () => ({
            sortBy: [
                {
                    desc: true,
                    id: activeSort,
                },
            ],
        }),
        [],
    );

    const volumeLabel = useMemo(() => {
        if (activePeriod === PeriodFilterOptions["30d"]) {
            return t("common.volume_30d");
        }

        if (activePeriod === PeriodFilterOptions["7d"]) {
            return t("common.volume_7d");
        }

        return t("common.volume_24h");
    }, [activePeriod]);

    const columns = useMemo(() => {
        const columns: Array<Column<App.Data.Collections.CollectionData>> = [
            {
                Header: t("common.collection").toString(),
                id: "name",
                accessor: (collection) => collection.name,
                className: "justify-start",
                cellWidth: "sm:w-full",
                paddingClassName: "py-2 px-2 md:px-5",
            },
            {
                Header: volumeLabel,
                id: "volume",
                headerClassName: "px-2 md:px-5",
                paddingClassName: "py-2 px-2 md:px-5",
                className: "min-w-[7rem] [&>div]:inline-flex [&>div]:w-full [&>div]:justify-end justify-end",
            },
        ];

        if (isMdAndAbove) {
            columns.splice(columns.length, 0, {
                Header: t("common.collection_preview").toString(),
                className: "whitespace-nowrap xl:w-64 lg:w-48",
            });

            columns.splice(columns.length - 1, 0, {
                Header: t("common.items").toString(),
                className: "justify-end whitespace-nowrap",
            });
        }

        if (isLgAndAbove) {
            columns.splice(-3, 0, {
                Header: t("common.floor_price").toString(),
                id: "floor-price",
                accessor: (collection) => collection.floorPrice,
                className: "justify-end whitespace-nowrap",
            });

            columns.splice(-1, 0, {
                Header: t("common.chain").toString(),
                id: "chain",
                accessor: (collection) => collection.chainId,
                className: "justify-end",
            });
        }

        return columns;
    }, [t, isMdAndAbove, isLgAndAbove, volumeLabel]);

    if (isLoading === true) {
        return (
            <Table
                data-testid="PopularCollectionsTable__SkeletonTable"
                headerClassName="hidden md-lg:table-header-group"
                variant="list"
                columns={columns as Array<Column<{ index: number }>>}
                data={range(20).map((index) => ({ index }))}
                row={({ index }) => (
                    <CollectionsTableItemSkeleton
                        key={index}
                        index={index}
                        animated
                    />
                )}
            />
        );
    }

    return (
        <Table
            data-testid="CollectionsTable"
            variant="list"
            columns={columns}
            initialState={activeSort.length > 0 ? initialState : {}}
            activeSort={activeSort}
            sortDirection={direction}
            manualSortBy={true}
            onSort={(column) => {
                const newDirection = column.id === activeSort ? (direction === "asc" ? "desc" : "asc") : "asc";

                setSortBy(column.id as CollectionsSortByOption, newDirection);
            }}
            data={collections}
            row={(collection) => (
                <CollectionsFullTableItem
                    collection={collection}
                    uniqueKey={collection.slug}
                    key={`${collection.address}-${collection.chainId}`}
                    user={user}
                />
            )}
        />
    );
};

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
            return 3;
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
            data-testid="CollectionLoading"
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
                        className="mr-2 h-4 w-10"
                        animated={animated}
                    />
                </TableCell>
            )}

            <TableCell
                variant="end-list"
                innerClassName="justify-center"
                paddingClassName="px-2 md:px-8"
                hoverClassName=""
            >
                <Skeleton
                    className="h-5 w-5 md:mt-0"
                    isCircle
                    animated={animated}
                />
            </TableCell>

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
        </TableRow>
    );
};
