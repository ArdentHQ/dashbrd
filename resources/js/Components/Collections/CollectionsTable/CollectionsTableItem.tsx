import { BigNumber } from "@ardenthq/sdk-helpers";
import { router } from "@inertiajs/react";
import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useInViewport } from "react-in-viewport";
import { type CollectionTableItemProperties } from "./CollectionsTable.contracts";
import { CollectionPortfolioValue } from "@/Components/Collections//CollectionPortfolioValue";
import { CollectionActions } from "@/Components/Collections/CollectionActions";
import { CollectionFloorPrice } from "@/Components/Collections/CollectionFloorPrice";
import { CollectionImages } from "@/Components/Collections/CollectionImages";
import { CollectionName } from "@/Components/Collections/CollectionName";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { TableCell, TableRow } from "@/Components/Table";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const CollectionsTableItem = ({
    collection,
    uniqueKey,
    user,
    isHidden,
    reportAvailableIn = null,
    alreadyReported = false,
    reportReasons,
    onVisible,
    onChanged,
    onReportCollection,
}: CollectionTableItemProperties): JSX.Element => {
    const { isMdAndAbove, isLgAndAbove, isXlAndAbove } = useBreakpoint();
    const { t } = useTranslation();

    const reference = useRef(null);

    useInViewport(reference, {}, undefined, {
        onEnterViewport: onVisible,
    });

    const nftsToShow = useMemo((): number => {
        if (isXlAndAbove) {
            return 4;
        }

        if (isLgAndAbove) {
            return 2;
        }

        return 1;
    }, [isXlAndAbove, isLgAndAbove]);

    const token = {
        symbol: collection.floorPrice.currency,
        name: collection.floorPrice.currency,
        decimals: collection.floorPrice.decimals,
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
                <CollectionName collection={collection}>
                    {collection.nftsCount} {t("common.owned")}
                </CollectionName>
            </TableCell>

            {isLgAndAbove && (
                <TableCell
                    innerClassName="justify-end"
                    paddingClassName="px-2 md:px-5"
                    hoverClassName=""
                >
                    {collection.floorPrice.value === null ? (
                        <span
                            data-testid="CollectionsTableItem__unknown-floor-price"
                            className="text-sm font-medium text-theme-secondary-500 dark:text-theme-dark-300"
                        >
                            {t("common.na")}
                        </span>
                    ) : (
                        <CollectionFloorPrice
                            collection={collection}
                            user={user ?? undefined}
                            fiatValue={collection.floorPrice.fiat}
                            token={token}
                            variant="list"
                        />
                    )}
                </TableCell>
            )}

            <TableCell
                innerClassName="justify-end"
                paddingClassName="px-2 md:px-5"
                hoverClassName=""
            >
                {collection.floorPrice.value === null ? (
                    <span
                        data-testid="CollectionsTableItem__unknown-value"
                        className="text-sm font-medium text-theme-secondary-500 dark:text-theme-dark-300"
                    >
                        {t("common.na")}
                    </span>
                ) : (
                    <CollectionPortfolioValue
                        user={user ?? undefined}
                        value={BigNumber.make(collection.floorPrice.value).times(collection.nftsCount).toString()}
                        convertedValue={BigNumber.make(collection.floorPrice.fiat ?? 0)
                            .times(collection.nftsCount)
                            .toString()}
                        token={token}
                        variant="list"
                    />
                )}
            </TableCell>

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
                        nftsCount={collection.nftsCount}
                        maxItems={nftsToShow}
                    />
                </TableCell>
            )}

            <TableCell
                variant="end-list"
                innerClassName="justify-end"
                paddingClassName="pr-2 pl-1.5 md:px-5"
                hoverClassName=""
            >
                <CollectionActions
                    collection={collection}
                    isHidden={isHidden}
                    buttonClassName="border-transparent md:border-theme-secondary-300 w-6 h-6 md:w-10 md:h-10 -mt-5 md:mt-0"
                    reportAvailableIn={reportAvailableIn}
                    alreadyReported={alreadyReported}
                    reportReasons={reportReasons}
                    onChanged={onChanged}
                    onReportCollection={onReportCollection}
                />
            </TableCell>
        </TableRow>
    );
};
