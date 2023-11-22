import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column } from "react-table";
import { type PopularCollectionTableProperties } from "./PopularCollectionsTable.contract";
import { PopularCollectionsTableItem } from "./PopularCollectionsTableItem";
import { Table } from "@/Components/Table";

export const PopularCollectionsTable = ({ collections, user }: PopularCollectionTableProperties): JSX.Element => {
    const { t } = useTranslation();

    const activeSort = "floor-price";

    const sortDirection = "desc";

    const columns = useMemo(() => {
        const columns: Array<Column<App.Data.Collections.PopularCollectionData>> = [
            {
                Header: t("common.collection").toString(),
                id: "name",
                className: "justify-start",
                cellWidth: "sm:w-full",
                paddingClassName: "py-2 px-2 md:px-5",
            },
            {
                Header: t("common.floor_price").toString(),
                id: "floor-price",
                className: "justify-end whitespace-nowrap",
            },
            {
                Header: t("common.volume").toString(),
                id: "volume",
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
