import { BigNumber } from "@ardenthq/sdk-helpers";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column, type TableState } from "react-table";
import { CollectionOfTheMonthTableItem } from "./CollectionOfTheMonthTableItem";
import { Table } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const CollectionOfTheMonthCandidatesTable = ({
    collections,
    activeSort,
    user,
}: {
    collections: App.Data.Collections.PopularCollectionData[];
    activeSort: string;
    user: App.Data.UserData | null;
}): JSX.Element => {
    const { t } = useTranslation();
    const { isMdAndAbove, isLgAndAbove } = useBreakpoint();

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
                Header: t("pages.collections.popular_collections").toString(),
                id: "name",
                accessor: (collection) => collection.name,
                className: "justify-start",
                cellWidth: "sm:w-full",
                paddingClassName: "py-2 px-2 md:px-5",
                disableSortBy: true,
            },
            {
                id: "action",
                paddingClassName: "px-0",
                disableSortBy: true,
            },
        ];

        if (isMdAndAbove) {
            columns.splice(-1, 0, {
                Header: t("common.volume").toString(),
                id: "value",
                accessor: (collection) =>
                    BigNumber.make(collection.floorPriceFiat ?? 0)
                        .times(collection.nftsCount)
                        .toString(),
                headerClassName: "px-2 md:px-5",
                paddingClassName: "py-2 px-2 md:px-5",
                className: "justify-end",
                disableSortBy: true,
            });

            columns.splice(-2, 0, {
                Header: t("common.floor_price").toString(),
                id: "floor-price",
                accessor: (collection) => collection.floorPriceFiat,
                className: "justify-end whitespace-nowrap",
            });
        }

        return columns;
    }, [t, isMdAndAbove, isLgAndAbove]);

    if (collections.length === 0) {
        return <></>;
    }

    return (
        <Table
            variant="list"
            columns={columns}
            data={collections}
            initialState={initialState}
            sortDirection="desc"
            manualSortBy={false}
            row={(collection: App.Data.Collections.PopularCollectionData) => (
                <CollectionOfTheMonthTableItem
                    collection={collection}
                    uniqueKey={`${collection.address}-${collection.chainId}`}
                    key={`${collection.address}-${collection.chainId}`}
                    user={user}
                />
            )}
        />
    );
};
