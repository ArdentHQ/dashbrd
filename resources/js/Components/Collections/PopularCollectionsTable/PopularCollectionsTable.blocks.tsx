import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { PriceChange } from "@/Components/PriceChange/PriceChange";
import { Tooltip } from "@/Components/Tooltip";
import { useIsTruncated } from "@/Hooks/useIsTruncated";
import { CollectionImageWithIcon } from "@/Pages/Collections/Components/CollectionImage";
import { FormatCrypto, FormatFiat, FormatVolume } from "@/Utils/Currency";

export const PopularCollectionName = ({
    collection,
}: {
    collection: App.Data.Collections.PopularCollectionData;
}): JSX.Element => {
    const collectionNameReference = useRef<HTMLParagraphElement>(null);
    const isTruncated = useIsTruncated({ reference: collectionNameReference });
    const { t } = useTranslation();

    return (
        <div
            data-testid="CollectionName"
            className="group relative h-11 w-full cursor-pointer md:h-12"
        >
            <div className="absolute flex w-full items-center space-x-4">
                <CollectionImageWithIcon
                    image={collection.image}
                    chainId={collection.chainId}
                    className="relative h-8 w-8 shrink-0 md:h-12 md:w-12"
                    wrapperClassName="aspect-square"
                    networkClassName="left-5 top-5 "
                />

                <div className="break-word-legacy min-w-0 space-y-0.5 md:lg:space-y-0">
                    <Tooltip
                        disabled={!isTruncated}
                        content={collection.name}
                    >
                        <p
                            ref={collectionNameReference}
                            data-testid="CollectionName__name"
                            className="truncate text-base font-medium text-theme-secondary-900 group-hover:text-theme-primary-700 dark:text-theme-dark-50 dark:group-hover:text-theme-primary-400 md-lg:text-lg"
                        >
                            {collection.name}
                        </p>
                    </Tooltip>

                    <p className="block truncate text-xs font-medium leading-4.5 text-theme-secondary-700 dark:text-theme-dark-200 md:text-sm md:leading-5.5 md-lg:hidden">
                        {t("common.volume")} <FormatVolume volume={collection.volume} />
                    </p>
                </div>
            </div>
        </div>
    );
};

export const PopularCollectionFloorPrice = ({
    collection,
}: {
    collection: Pick<App.Data.Collections.PopularCollectionData, "floorPrice">;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            data-testid="PopularCollectionFloorPrice"
            className="inline-block"
        >
            <div className="flex flex-col items-end space-y-0.5 whitespace-nowrap font-medium">
                <div
                    data-testid="CollectionFloorPrice__crypto"
                    className="text-sm leading-5.5 text-theme-secondary-700 dark:text-theme-dark-200 md:text-base md:leading-6"
                >
                    <FormatCrypto
                        value={collection.floorPrice.value ?? "0"}
                        token={{
                            symbol: collection.floorPrice.currency,
                            name: collection.floorPrice.currency,
                            decimals: collection.floorPrice.decimals,
                        }}
                    />
                </div>

                <span
                    data-testid="PopularCollectionFloorPrice__price-change"
                    className="text-sm"
                >
                    {collection.floorPrice.change != null ? (
                        <PriceChange change={collection.floorPrice.change} />
                    ) : (
                        <span className="text-theme-secondary-500 dark:text-theme-dark-300">{t("common.na")}</span>
                    )}
                </span>
            </div>
        </div>
    );
};

export const PopularCollectionVolume = ({
    collection,
    user,
}: {
    collection: Pick<App.Data.Collections.PopularCollectionData, "volume">;
    user: App.Data.UserData | null;
}): JSX.Element => (
    <div
        data-testid="PopularCollectionVolume"
        className="inline-block"
    >
        <div className="flex flex-col items-end space-y-0.5 whitespace-nowrap font-medium">
            <div
                data-testid="PopularCollectionVolume__crypto"
                className="text-theme-secondary-900 dark:text-theme-dark-50"
            >
                <FormatVolume volume={collection.volume} />
            </div>

            <div
                data-testid="PopularCollectionVolume__fiat"
                className="text-sm text-theme-secondary-500 dark:text-theme-dark-300"
            >
                {collection.volume.fiat !== null && (
                    <FormatFiat
                        user={user ?? undefined}
                        value={collection.volume.fiat.toString()}
                    />
                )}
            </div>
        </div>
    </div>
);
