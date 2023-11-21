import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column, type TableState } from "react-table";
import { type PopularCollectionTableProperties } from "./PopularCollectionsTable.contract";
import { PopularCollectionsTableItem } from "./PopularCollectionsTableItem";
import { Table } from "@/Components/Table";

export const PopularCollectionsTable = ({ collections, user }: PopularCollectionTableProperties): JSX.Element => {
    const { t } = useTranslation();

    const activeSort = "floor-price";

    const sortDirection = "desc";

    const initialState = useMemo<Partial<TableState<App.Data.Collections.PopularCollectionData>>>(
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
        const columns: Array<Column<App.Data.Collections.PopularCollectionData>> = [
            {
                Header: t("common.collection").toString(),
                id: "name",
                accessor: (collection) => collection.name,
                className: "justify-start",
                cellWidth: "sm:w-full",
                paddingClassName: "py-2 px-2 md:px-5",
            },
            {
                Header: t("common.floor_price").toString(),
                id: "floor-price",
                accessor: (collection) => collection.floorPriceFiat,
                className: "justify-end whitespace-nowrap",
            },
            {
                Header: t("common.volume").toString(),
                id: "volume",
                // @TODO: change this
                accessor: (collection) => collection.floorPriceFiat,
                className: "justify-end whitespace-nowrap",
            },
        ];

        return columns;
    }, [t]);

    if (collections.length === 0) {
        return <></>;
    }

    return (
        <Table
            data-testid="PopularCollectionsTable"
            variant="list"
            columns={columns}
            initialState={initialState}
            activeSort={activeSort}
            sortDirection={sortDirection}
            manualSortBy={true}
            data={collections}
            row={(collection: App.Data.Collections.PopularCollectionData) => (
                <PopularCollectionsTableItem
                    collection={collection}
                    uniqueKey={`${collection.slug}-${collection.chainId}`}
                    key={`${collection.slug}-${collection.chainId}`}
                    user={user}
                />
            )}
        />
    );
};
