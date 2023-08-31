import { BigNumber } from "@ardenthq/sdk-helpers";
import { router } from "@inertiajs/react";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useInViewport } from "react-in-viewport";
import { CollectionActions } from "@/Components/Collections/CollectionActions";
import { CollectionCoverImages } from "@/Components/Collections/CollectionCoverImages";
import { CollectionFloorPrice } from "@/Components/Collections/CollectionFloorPrice";
import { CollectionPortfolioValue } from "@/Components/Collections/CollectionPortfolioValue";
import { Img } from "@/Components/Image";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";

interface CollectionCardProperties {
    collection: App.Data.Collections.CollectionData;
    nfts: App.Data.Collections.CollectionNftData[];
    isHidden?: boolean;
    reportAvailableIn?: string | null;
    alreadyReported?: boolean | null;
    reportReasons?: Record<string, string>;
    onVisible?: () => void;
    onChanged: () => void;
    onReportCollection?: (address: string) => void;
}

export const CollectionCard = ({
    collection,
    nfts,
    reportAvailableIn,
    isHidden = false,
    alreadyReported = false,
    reportReasons,
    onVisible,
    onChanged,
    onReportCollection,
}: CollectionCardProperties): JSX.Element => {
    const { t } = useTranslation();

    const token = {
        symbol: collection.floorPriceCurrency ?? "ETH",
        name: collection.floorPriceCurrency ?? "ETH",
        decimals: collection.floorPriceDecimals ?? 18,
    };

    const collectionNameReference = useRef<HTMLSpanElement>(null);
    const isTruncated = useIsTruncated({ reference: collectionNameReference });

    const reference = useRef(null);

    const collectionNfts = useMemo(() => nfts.filter((nft) => nft.collectionId === collection.id), [nfts]);

    useInViewport(reference, {}, undefined, {
        onEnterViewport: onVisible,
    });

    return (
        <div
            ref={reference}
            data-testid="CollectionCard"
            className="transition-default group relative flex cursor-pointer flex-col rounded-xl border border-theme-secondary-300 p-8 outline outline-3 outline-transparent hover:outline-theme-hint-100 focus-visible:outline-theme-hint-300"
            onClick={() => {
                router.visit(
                    route("collections.view", {
                        slug: collection.slug,
                    }),
                );
            }}
        >
            <div className="absolute inset-x-0 top-3 z-10 flex justify-end px-3">
                <CollectionActions
                    collection={collection}
                    isHidden={isHidden}
                    buttonClassName="border-4 border-white hover:border-theme-secondary-300 active:border-theme-secondary-400"
                    reportAvailableIn={reportAvailableIn}
                    alreadyReported={alreadyReported}
                    reportReasons={reportReasons}
                    onChanged={onChanged}
                    onReportCollection={onReportCollection}
                />
            </div>

            <div className="aspect-[3/2] w-full rounded-lg">
                <CollectionCoverImages nfts={collectionNfts} />
            </div>

            <div className="relative mx-auto -mt-11 flex items-center justify-center">
                <div className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full backdrop-blur-md">
                    <Img
                        className="aspect-square h-20 w-20 rounded-full bg-theme-secondary-100 object-cover"
                        src={collection.image ?? undefined}
                        data-testid="CollectionCard__image"
                        isCircle
                    />
                </div>

                <div className="absolute left-[3.875rem] top-[3.875rem] h-5 w-5 rounded-full ring-4 ring-white">
                    <NetworkIcon networkId={collection.chainId} />
                </div>
            </div>

            <Tooltip
                content={collection.name}
                disabled={!isTruncated}
            >
                <span
                    ref={collectionNameReference}
                    className="break-word-legacy group-hover mx-auto mt-1 max-w-full truncate text-lg font-medium leading-7 group-hover:text-theme-hint-700"
                >
                    {collection.name}
                </span>
            </Tooltip>

            <div className="mt-3 flex">
                <div className="flex flex-1 justify-end">
                    <div className="ml-auto flex flex-col space-y-0.5 font-medium">
                        <span className="whitespace-nowrap text-sm leading-5.5 text-theme-secondary-500">
                            {t("pages.collections.floor_price")}
                        </span>

                        {collection.floorPrice === null ? (
                            <span
                                data-testid="CollectionCard__unknown-floor-price"
                                className="text-sm font-medium text-theme-secondary-300"
                            >
                                {t("common.na")}
                            </span>
                        ) : (
                            <CollectionFloorPrice
                                collection={collection}
                                token={token}
                                variant="grid"
                            />
                        )}
                    </div>
                </div>

                <div className="mx-6 border-l border-theme-secondary-300" />

                <div className="flex flex-1 flex-col font-medium">
                    <div className="mr-auto flex flex-col space-y-0.5 font-medium">
                        <span className="whitespace-nowrap text-sm leading-5.5 text-theme-secondary-500">
                            {t("pages.collections.value")}
                        </span>

                        <span>
                            {collection.floorPrice === null ? (
                                <span
                                    data-testid="CollectionCard__unknown-value"
                                    className="text-sm font-medium text-theme-secondary-300"
                                >
                                    {t("common.na")}
                                </span>
                            ) : (
                                <CollectionPortfolioValue
                                    value={BigNumber.make(collection.floorPrice).times(collection.nftsCount).toString()}
                                    token={token}
                                    variant="grid"
                                />
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
