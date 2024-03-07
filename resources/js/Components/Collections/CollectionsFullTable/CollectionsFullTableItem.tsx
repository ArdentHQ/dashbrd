import { router } from "@inertiajs/react";
import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { type CollectionTableItemProperties } from "./CollectionsFullTable.contracts";
import { CollectionImages } from "@/Components/Collections/CollectionImages";
import { CollectionName } from "@/Components/Collections/CollectionName";
import {
    PopularCollectionFloorPrice,
    PopularCollectionVolume,
} from "@/Components/Collections/PopularCollectionsTable/PopularCollectionsTable.blocks";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { TableCell, TableRow } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";
import { formatNumbershort } from "@/Utils/format-number";

export const CollectionsFullTableItem = ({
    collection,
    uniqueKey,
    user,
}: CollectionTableItemProperties): JSX.Element => {
    const { isMdAndAbove, isLgAndAbove, isXlAndAbove, isSmAndAbove } = useBreakpoint();
    const { t } = useTranslation();

    const reference = useRef(null);

    const nftsToShow = useMemo((): number => {
        if (isLgAndAbove) {
            return 3;
        }

        if (isSmAndAbove) {
            return 2;
        }

        return 1;
    }, [isXlAndAbove, isLgAndAbove]);

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
                className="w-full"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                <CollectionName collection={collection}>
                    {collection.nftsCount} {t("common.items").toLowerCase()}
                </CollectionName>
            </TableCell>

            {isLgAndAbove && (
                <TableCell
                    innerClassName="justify-end"
                    paddingClassName="px-2 md:px-5"
                    hoverClassName=""
                >
                    <PopularCollectionFloorPrice collection={collection} />
                </TableCell>
            )}

            <TableCell
                innerClassName="justify-end min-w-[7rem]"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                <PopularCollectionVolume
                    collection={collection}
                    user={user}
                />
            </TableCell>

            {isMdAndAbove && (
                <TableCell
                    innerClassName="justify-end"
                    paddingClassName="px-2 md:px-5"
                    hoverClassName=""
                >
                    <div className="text-sm font-medium leading-5.5 text-theme-secondary-900 dark:text-theme-dark-50 md:text-base md:leading-6">
                        {collection.supply !== null ? (
                            formatNumbershort(collection.supply)
                        ) : (
                            <span
                                data-testid="CollectionsTableItem__unknown-supply"
                                className="text-sm font-medium text-theme-secondary-500 dark:text-theme-dark-300"
                            >
                                {t("common.na")}
                            </span>
                        )}
                    </div>
                </TableCell>
            )}

            {isLgAndAbove && (
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
            )}

            {isMdAndAbove && (
                <TableCell
                    variant="end-list"
                    paddingClassName="px-2 md:px-5"
                    hoverClassName=""
                >
                    <CollectionImages
                        nfts={collection.nfts}
                        nftsCount={collection.nftsCount > nftsToShow ? nftsToShow : collection.nftsCount}
                        maxItems={nftsToShow}
                    />
                </TableCell>
            )}
        </TableRow>
    );
};
