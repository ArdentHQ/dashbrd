import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column } from "react-table";
import { type PopularCollectionTableProperties } from "./PopularCollectionsTable.contract";
import { PopularCollectionsTableItem, PopularCollectionsTableItemSkeleton } from "./PopularCollectionsTableItem";
import { Table } from "@/Components/Table";
import { PeriodFilterOptions } from "@/Pages/Collections/Components/CollectionsFilterTabs";

export const PopularCollectionsTable = ({
    collections,
    user,
    period,
    activePeriod,
    isLoading = false,
}: PopularCollectionTableProperties): JSX.Element => {
    const { t } = useTranslation();

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
        const columns: Array<Column<{ index: number } | App.Data.Collections.PopularCollectionData>> = [
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
                headerClassName: "hidden xl:table-cell",
                className: "justify-end whitespace-nowrap [&_div]:w-full [&_div]:flex [&_div]:justify-end",
            },
            {
                headerClassName: "hidden md-lg:table-cell",
                Header: volumeLabel,
                id: "volume",
                className: "justify-end min-w-[7rem] [&_div]:w-full [&_div]:flex [&_div]:justify-end px-2",
            },
        ];

        return columns;
    }, [t, period, volumeLabel]);

    if (isLoading) {
        return (
            <Table
                data-testid="PopularCollectionsTable"
                headerClassName="hidden md-lg:table-header-group"
                variant="list"
                columns={columns as Column<{ index: number }>[]}
                manualSortBy={true}
                data={Array.from({ length: 6 }, (x, index) => ({ index }))}
                row={({ index }) => <PopularCollectionsTableItemSkeleton index={index} />}
            />
        );
    }

    if (collections.length === 0) {
        return <></>;
    }

    return (
        <Table
            data-testid="PopularCollectionsTable"
            headerClassName="hidden md-lg:table-header-group"
            variant="list"
            columns={columns as Column<App.Data.Collections.PopularCollectionData>[]}
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
