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

export const FeaturedCollectionsItem = ({
    data,
}: {
    data: App.Data.Collections.CollectionFeaturedData;
}): JSX.Element => {
    const { t } = useTranslation();

    const token: Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals"> = {
        name: "",
        symbol: data.floorPriceCurrency ?? "",
        decimals: data.floorPriceDecimals ?? 18,
    };

    return (
        <div className="relative">
            <div className="collection-banner absolute left-0 top-0 -z-10 h-full w-full ">
                <Img
                    className="h-full w-full object-cover"
                    wrapperClassName="h-full"
                    alt={data.name}
                    src={data.banner}
                    errorPlaceholder={<div className="bg-white" />}
                />

                <div className="featured-collections-overlay absolute left-0 top-0 h-full w-full" />
            </div>

            <div className=" left-0 top-0 z-10 w-full p-6 md-lg:p-8">
                <div className="flex flex-col gap-6 md-lg:flex-row md-lg:justify-between md-lg:gap-8">
                    <div className="flex flex-col md-lg:max-w-[448px] md-lg:py-2 xl:w-[460px] 2xl:max-w-[600px]">
                        <div className="flex flex-row gap-4">
                            <div className="relative h-12 w-12 shrink-0">
                                <Img
                                    wrapperClassName="aspect-square"
                                    className="h-full w-full rounded-full object-cover"
                                    src={data.image}
                                    isCircle
                                />

                                <div className="absolute bottom-0 right-0 block h-4 w-4 rounded-full ring-4 ring-theme-secondary-50 dark:ring-theme-dark-950">
                                    <NetworkIcon networkId={data.chainId} />
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
                                    {data.name}
                                </Heading>
                            </div>
                        </div>

                        <div className="my-3 line-clamp-4 text-base font-medium leading-6 text-theme-secondary-700 dark:text-theme-dark-200">
                            {truncateDescription(data.description)}
                        </div>

                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between md-lg:flex-col md-lg:items-start">
                            <div className="flex flex-row items-center justify-start">
                                <GridHeader
                                    className="!px-0"
                                    wrapperClassName="w-fit"
                                    title={t("common.nfts")}
                                    value={data.nftsCount}
                                />
                                <div className="mx-4 h-8 w-px bg-theme-secondary-300 dark:bg-theme-dark-700 sm:mx-6" />
                                <GridHeader
                                    className="!px-0"
                                    wrapperClassName="w-fit"
                                    title={t("common.floor_price")}
                                    value={
                                        <FormatCrypto
                                            value={data.floorPrice ?? "0"}
                                            token={token}
                                        />
                                    }
                                />
                                <div className="mx-4 h-8 w-px bg-theme-secondary-300 dark:bg-theme-dark-700 sm:mx-6" />
                                <GridHeader
                                    className="!px-0"
                                    wrapperClassName="w-fit"
                                    title={t("common.volume", { frequency: "" })}
                                    value={
                                        <FormatCrypto
                                            value={data.volume ?? "0"}
                                            token={token}
                                            maximumFractionDigits={2}
                                        />
                                    }
                                />
                            </div>

                            <ButtonLink
                                className="w-full justify-center sm:h-fit sm:w-auto"
                                variant="primary"
                                href={route("collections.view", {
                                    slug: data.slug,
                                })}
                            >
                                {t("pages.collections.featured.button")}
                            </ButtonLink>
                        </div>
                    </div>

                    <div className="grid w-full grid-flow-col items-center gap-3 lg:w-fit">
                        <CollectionNft
                            nft={data.nfts[0]}
                            classNames="bg-white dark:bg-theme-dark-900 grid w-full h-full min-w-full lg:min-w-fit lg:w-60"
                        />
                        {data.nfts.length > 1 && (
                            <CollectionNft
                                nft={data.nfts[1]}
                                classNames="bg-white dark:bg-theme-dark-900 sm:grid hidden w-full h-full min-w-full lg:min-w-fit lg:w-60"
                            />
                        )}
                        {data.nfts.length > 2 && (
                            <CollectionNft
                                nft={data.nfts[2]}
                                classNames="bg-white dark:bg-theme-dark-900 md:grid md-lg:hidden hidden w-full h-full min-w-full lg:min-w-fit lg:w-60 xl:grid"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
