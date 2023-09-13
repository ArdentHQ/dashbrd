import { BigNumber } from "@ardenthq/sdk-helpers";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column, type TableState } from "react-table";
import { type CollectionTableProperties } from "./CollectionsTable.contracts";
import { CollectionsTableItem } from "./CollectionsTableItem";
import { CollectionsTableItemSkeleton } from "./CollectionsTableItemSkeleton";
import { Table } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

const skeletonsCount = 10;

export const CollectionsTable = ({
    collections,
    nfts,
    user,
    hiddenCollectionAddresses,
    reportByCollectionAvailableIn,
    alreadyReportedByCollection,
    reportReasons,
    onLoadMore,
    isLoading = false,
    onChanged,
    activeSort = "",
    sortDirection = "asc",
    onSort,
    onReportCollection,
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
                Header: t("common.value").toString(),
                id: "value",
                accessor: (collection) =>
                    BigNumber.make(collection.floorPriceFiat ?? 0)
                        .times(collection.nftsCount)
                        .toString(),
                headerClassName: "px-2 md:px-5",
                paddingClassName: "py-2 px-2 md:px-5",
                className: "justify-end",
            },
            {
                id: "action",
                disableSortBy: true,
            },
        ];

        if (isMdAndAbove) {
            columns.splice(-1, 0, {
                Header: t("common.my_collection").toString(),
                className: "whitespace-nowrap xl:w-96 lg:w-48",
                disableSortBy: true,
            });
        }

        if (isLgAndAbove) {
            columns.splice(-3, 0, {
                Header: t("common.floor_price").toString(),
                id: "floor-price",
                accessor: (collection) => collection.floorPriceFiat,
                className: "justify-end whitespace-nowrap",
            });

            columns.splice(-2, 0, {
                Header: t("common.chain").toString(),
                id: "chain",
                accessor: (collection) => collection.chainId,
                className: "justify-end",
            });
        }

        return columns;
    }, [t, isMdAndAbove, isLgAndAbove]);

    if (isLoading) {
        return (
            <Table
                data-testid="CollectionsTableSkeleton"
                variant="list"
                columns={columns}
                data={
                    Array.from({ length: skeletonsCount }).fill({
                        floorPriceFiat: 1,
                        nftsCount: 1,
                    }) as App.Data.Collections.CollectionData[]
                }
                row={(_, index: number) => (
                    <CollectionsTableItemSkeleton
                        index={index}
                        animated={user !== null}
                    />
                )}
            />
        );
    }

    if (collections.length === 0) {
        return <></>;
    }

    return (
        <Table
            data-testid="CollectionsTable"
            variant="list"
            columns={columns}
            initialState={activeSort.length > 0 ? initialState : {}}
            activeSort={activeSort}
            sortDirection={sortDirection}
            onSort={
                onSort != null
                    ? (column) => {
                          const direction =
                              column.id === activeSort ? (sortDirection === "asc" ? "desc" : "asc") : "asc";

                          onSort(column.id, direction);
                      }
                    : undefined
            }
            data={collections}
            row={(collection: App.Data.Collections.CollectionData, index: number) => (
                <CollectionsTableItem
                    collection={collection}
                    nfts={nfts}
                    uniqueKey={`${collection.address}-${collection.chainId}`}
                    key={`${collection.address}-${collection.chainId}`}
                    user={user}
                    isHidden={hiddenCollectionAddresses.includes(collection.address)}
                    reportAvailableIn={reportByCollectionAvailableIn[collection.address]}
                    alreadyReported={alreadyReportedByCollection[collection.address]}
                    reportReasons={reportReasons}
                    onVisible={() => {
                        const isViewingLastItems = collections.length - index < 10;

                        if (!isViewingLastItems) {
                            return;
                        }

                        onLoadMore?.();
                    }}
                    onChanged={onChanged}
                    onReportCollection={onReportCollection}
                />
            )}
        />
    );
};
