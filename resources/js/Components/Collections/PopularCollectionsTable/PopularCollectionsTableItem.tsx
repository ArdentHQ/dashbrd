import { router } from "@inertiajs/react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { PopularCollectionName } from "./PopularCollectionsTable.blocks";
import { type PopularCollectionTableItemProperties } from "./PopularCollectionsTable.contract";
import { CollectionFloorPrice } from "@/Components/Collections/CollectionFloorPrice";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
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
            >
                <PopularCollectionName collection={collection} />
            </TableCell>

            <TableCell
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5"
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
                className="end-cell-until-md"
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                <div className="mr-2 h-5 w-5">
                    <NetworkIcon networkId={collection.chainId} />
                </div>
            </TableCell>
        </TableRow>
    );
};
