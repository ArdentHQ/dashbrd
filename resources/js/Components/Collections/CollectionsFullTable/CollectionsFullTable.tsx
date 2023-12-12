import { BigNumber } from "@ardenthq/sdk-helpers";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column, type TableState } from "react-table";
import { type CollectionTableProperties } from "./CollectionsFullTable.contracts";
import { CollectionsFullTableItem } from "./CollectionsFullTableItem";
import { Table } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const CollectionsFullTable = ({
    collections,
    user,
    activeSort = "",
    sortDirection = "asc",
    onSort,
    selectedChainIds,
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
        ];

        if (isMdAndAbove) {
            columns.splice(columns.length, 0, {
                Header: t("common.collection_preview").toString(),
                className: "whitespace-nowrap xl:w-64 lg:w-48",
                disableSortBy: true,
            });

            columns.splice(columns.length - 1, 0, {
                Header: t("common.items").toString(),
                className: "justify-end whitespace-nowrap",
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

            columns.splice(-1, 0, {
                Header: t("common.chain").toString(),
                id: "chain",
                accessor: (collection) => collection.chainId,
                className: "justify-end",
            });
        }

        return columns;
    }, [t, isMdAndAbove, isLgAndAbove]);

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
            manualSortBy={true}
            onSort={
                onSort != null
                    ? (column) => {
                          const direction =
                              column.id === activeSort ? (sortDirection === "asc" ? "desc" : "asc") : "asc";

                          onSort({ sortBy: column.id, direction, selectedChainIds });
                      }
                    : undefined
            }
            data={collections}
            row={(collection: App.Data.Collections.CollectionData) => (
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
