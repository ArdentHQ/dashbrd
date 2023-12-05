import { BigNumber } from "@ardenthq/sdk-helpers";
import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { type Column, type TableState } from "react-table";
import { Button } from "@/Components/Buttons";
import { NominateCollectionName } from "@/Components/Collections/CollectionName";
import {
    PopularCollectionFloorPrice,
    PopularCollectionVolume,
} from "@/Components/Collections/PopularCollectionsTable/PopularCollectionsTable.blocks";
import { Dialog } from "@/Components/Dialog";
import { Radio } from "@/Components/Form/Radio";
import { SearchInput } from "@/Components/Form/SearchInput";
import { Table, TableCell, TableRow } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const CollectionsTableItem = ({
    collection,
    uniqueKey,
    user,
}: {
    collection: App.Data.Collections.PopularCollectionData;
    uniqueKey: string;
    user: App.Data.UserData | null;
}): JSX.Element => {
    const reference = useRef(null);

    return (
        <TableRow
            ref={reference}
            key={uniqueKey}
            className="group cursor-pointer dark:border-theme-dark-700"
            onClick={() => {
                console.log("TODO: implement");
            }}
        >
            <TableCell
                variant="start-list"
                paddingClassName="px-0 md:pl-3 md:py-4"
                hoverClassName=""
            >
                <NominateCollectionName collection={collection} />
            </TableCell>

            <TableCell
                className="hidden md:table-cell"
                innerClassName="justify-end"
                hoverClassName=""
            >
                <PopularCollectionFloorPrice collection={collection} />
            </TableCell>

            <TableCell
                className="hidden md:table-cell"
                innerClassName="justify-end"
                hoverClassName=""
            >
                <PopularCollectionVolume
                    collection={collection}
                    user={user}
                />
            </TableCell>

            <TableCell
                className="table-cell"
                innerClassName="justify-end"
                paddingClassName="px-0 md:pr-3 md:pl-4"
                hoverClassName=""
            >
                <Radio
                    name="selected"
                    className=""
                    onChange={(event) => {
                        console.log(event);
                    }}
                />
            </TableCell>
        </TableRow>
    );
};

const NominationDialogFooter = ({ setIsOpen }: { setIsOpen: (isOpen: boolean) => void }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="w-full border-t border-theme-secondary-300 px-6 py-4 dark:border-theme-dark-700 sm:flex sm:flex-row sm:justify-end">
            <div className="flex flex-row items-center justify-center gap-3 sm:w-fit">
                <Button
                    variant="secondary"
                    onClick={(): void => {
                        setIsOpen(false);
                    }}
                    className="w-full justify-center"
                >
                    {t("common.cancel")}
                </Button>

                <Button
                    variant="primary"
                    onClick={(): void => {
                        console.log("TODO: implement");
                    }}
                    disabled={true}
                    className="w-full items-end justify-center"
                >
                    {t("common.confirm")}
                </Button>
            </div>
        </div>
    );
};

const NominationCandidatesTable = ({
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
                <CollectionsTableItem
                    collection={collection}
                    uniqueKey={`${collection.address}-${collection.chainId}`}
                    key={`${collection.address}-${collection.chainId}`}
                    user={user}
                />
            )}
        />
    );
};

export const NominationDialog = ({
    isOpen,
    setIsOpen,
    collections,
    user,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    collections: App.Data.Collections.PopularCollectionData[];
    user: App.Data.UserData | null;
}): JSX.Element => {
    const { t } = useTranslation();
    const [query, setQuery] = useState<string>("");

    return (
        <Dialog
            title={t("pages.collections.vote.or_nominate_collection")}
            isOpen={isOpen}
            onClose={(): void => {
                setIsOpen(false);
            }}
            panelClassName="md:max-w-[640px]"
            footer={<NominationDialogFooter setIsOpen={setIsOpen} />}
        >
            <div className="flex flex-col md:gap-0">
                <SearchInput
                    placeholder={t("pages.collections.search_placeholder")}
                    query={query}
                    onChange={setQuery}
                />

                <NominationCandidatesTable
                    collections={collections}
                    activeSort=""
                    user={user}
                />
            </div>
        </Dialog>
    );
};
