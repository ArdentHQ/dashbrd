import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type Column, type TableState } from "react-table";
import { NomineeCollection } from "./NomineeCollection";
import { Table } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const NomineeCollections = ({
    collections,
    activeSort,
    user,
    selectedCollection,
    setSelectedCollection,
    showHeaderWhenEmpty = false,
}: {
    collections: App.Data.Collections.VotableCollectionData[];
    activeSort: string;
    user: App.Data.UserData | null;
    selectedCollection: number;
    setSelectedCollection: (selectedCollection: number) => void;
    showHeaderWhenEmpty?: boolean;
}): JSX.Element => {
    const { t } = useTranslation();
    const { isMdAndAbove, isLgAndAbove } = useBreakpoint();

    const initialState = useMemo<Partial<TableState<App.Data.Collections.VotableCollectionData>>>(
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
        const columns: Array<Column<App.Data.Collections.VotableCollectionData>> = [
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
                paddingClassName: "px-0 [&_>_div]:w-12",
                disableSortBy: true,
            },
        ];

        // @TODO fix 0s below collection.floorPriceFiat && nfts_count
        if (isMdAndAbove) {
            columns.splice(-1, 0, {
                Header: t("common.volume_30d").toString(),
                id: "value",
                headerClassName: "px-2 md:px-5",
                paddingClassName: "py-2 px-2 md:px-5",
                className: "justify-end min-w-[7rem]",
                disableSortBy: true,
            });

            columns.splice(-2, 0, {
                Header: t("common.floor_price").toString(),
                id: "floor-price",
                accessor: (collection) => collection.floorPrice,
                className: "justify-end whitespace-nowrap",
                disableSortBy: true,
            });
        }

        return columns;
    }, [t, isMdAndAbove, isLgAndAbove]);

    if (!showHeaderWhenEmpty && collections.length === 0) {
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
            row={(collection: App.Data.Collections.VotableCollectionData) => (
                <NomineeCollection
                    collection={collection}
                    uniqueKey={collection.id.toString()}
                    key={collection.id}
                    user={user}
                    selectedCollection={selectedCollection}
                    setSelectedCollection={setSelectedCollection}
                />
            )}
        />
    );
};
