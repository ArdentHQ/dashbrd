import React from "react";
import { useTranslation } from "react-i18next";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { GridHeader } from "@/Components/GridHeader";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";
import { CollectionNft } from "@/Pages/Collections/Components/CollectionNft";
import { FormatCrypto } from "@/Utils/Currency";

const truncateDescription = (
    description: App.Data.Collections.CollectionFeaturedData["description"],
): string | null => {
    if (description !== null && description.length > 120) {
        return description.slice(0, 120) + "...";
    }

    return description;
};

export const FeaturedCollectionsSlider = ({
    featuredCollections,
}: {
    featuredCollections: App.Data.Collections.CollectionFeaturedData[];
}): JSX.Element => {
    const { t } = useTranslation();
    const testCollection = featuredCollections[3];

    const token: Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals"> = {
        name: "",
        symbol: testCollection.floorPriceCurrency ?? "",
        decimals: testCollection.floorPriceDecimals ?? 18,
    };
    console.log({ testCollection });

    return (
        <div className="relative">
            {/* Featured Collections Background */}
            <div className="collection-banner relative h-[700px] w-full">
                <Img
                    className="h-full w-full object-cover"
                    wrapperClassName="h-full"
                    alt={testCollection.name}
                    src={testCollection.banner}
                    errorPlaceholder={<div className="bg-white" />}
                />

                <div className="featured-collections-overlay absolute left-0 top-0 h-full w-full" />
            </div>

            {/* Featured Collections Content */}
            <div className="absolute left-0 top-0 w-full p-6">
                <div className="flex flex-col gap-6">
                    {/* Featured Collections Data */}
                    <div className="flex flex-col">
                        {/* Featured Collections Header */}
                        <div className="flex flex-row gap-4">
                            <div className="relative h-12 w-12 shrink-0">
                                <Img
                                    wrapperClassName="aspect-square"
                                    className="h-full w-full rounded-full object-cover"
                                    src={testCollection.image}
                                    isCircle
                                />

                                <div className="absolute bottom-0 right-0 block h-4 w-4 rounded-full ring-4 ring-theme-secondary-50 dark:ring-theme-dark-950 md:hidden">
                                    <NetworkIcon networkId={testCollection.chainId} />
                                </div>
                            </div>

                            <div className="flex flex-col ">
                                <span className="text-sm font-medium capitalize leading-6 text-theme-secondary-700 dark:text-theme-dark-200">
                                    {t("pages.collections.featured.title")}
                                </span>
                                <Heading
                                    className="text-xl"
                                    level={3}
                                >
                                    {testCollection.name}
                                </Heading>
                            </div>
                        </div>

                        {/* Featured Collections Body */}
                        <div className="my-3 line-clamp-4 text-base font-medium leading-6 text-theme-secondary-700 dark:text-theme-dark-200">
                            {truncateDescription(testCollection.description)}
                        </div>

                        {/* Featured Collections Footer */}
                        <div className="flex flex-col gap-6 ">
                            <div className="flex flex-row items-center justify-start">
                                <GridHeader
                                    className="!px-0"
                                    wrapperClassName="w-fit"
                                    title={t("common.nfts")}
                                    value={testCollection.nftsCount}
                                />
                                <div className="mx-4 h-8 w-px bg-theme-secondary-300 dark:bg-theme-dark-700" />
                                <GridHeader
                                    className="!px-0"
                                    wrapperClassName="w-fit"
                                    title={t("common.floor_price")}
                                    value={
                                        <FormatCrypto
                                            value={testCollection.floorPrice ?? "0"}
                                            token={token}
                                        />
                                    }
                                />
                                <div className="mx-4 h-8 w-px bg-theme-secondary-300 dark:bg-theme-dark-700" />
                                <GridHeader
                                    className="!px-0"
                                    wrapperClassName="w-fit"
                                    title={t("common.volume", { frequency: "" })}
                                    value={
                                        <FormatCrypto
                                            value={testCollection.volume ?? "0"}
                                            token={token}
                                            maximumFractionDigits={2}
                                        />
                                    }
                                />
                            </div>

                            <ButtonLink
                                className="w-full justify-center sm:w-auto"
                                variant="primary"
                                href={route("collections.view", {
                                    slug: testCollection.slug,
                                })}
                            >
                                {t("pages.collections.featured.button")}
                            </ButtonLink>
                        </div>
                    </div>

                    {/* Featured Collections Nfts */}
                    <div className="block">
                        <CollectionNft
                            nft={testCollection.nfts[0]}
                            classNames="bg-white dark:bg-theme-dark-900 grid"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
