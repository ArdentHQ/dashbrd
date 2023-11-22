import { router } from "@inertiajs/react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { PopularCollectionName } from "./PopularCollectionsTable.blocks";
import { type PopularCollectionTableItemProperties } from "./PopularCollectionsTable.contract";
import { CollectionFloorPrice } from "@/Components/Collections/CollectionFloorPrice";
import { TableCell, TableRow } from "@/Components/Table";

export const PopularCollectionsTableItem = ({
    collection,
    uniqueKey,
    user,
}: PopularCollectionTableItemProperties): JSX.Element => {
    const { t } = useTranslation();

    const reference = useRef(null);

    const token = {
        symbol: collection.floorPriceCurrency ?? "ETH",
        name: collection.floorPriceCurrency ?? "ETH",
        decimals: collection.floorPriceDecimals ?? 18,
    };

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
                paddingClassName="px-2 md:px-5 "
                hoverClassName=""
            >
                {collection.floorPrice === null || user === null ? (
                    <span
                        data-testid="CollectionsTableItem__unknown-floor-price"
                        className="text-sm font-medium text-theme-secondary-500 dark:text-theme-dark-300"
                    >
                        {t("common.na")}
                    </span>
                ) : (
                    <CollectionFloorPrice
                        collection={collection}
                        user={user}
                        fiatValue={collection.floorPriceFiat}
                        token={token}
                        variant="list"
                    />
                )}
            </TableCell>

            <TableCell
                className="hidden md-lg:table-cell"
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                VOLUME
            </TableCell>
        </TableRow>
    );
};
