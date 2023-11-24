import React from "react";
import { useTranslation } from "react-i18next";
import { FeaturedCollectionNfts } from "./FeaturedCollectionNfts";
import { FeaturedCollectionStats } from "./FeaturedCollectionStats";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { Heading } from "@/Components/Heading";
import { Img } from "@/Components/Image";
import { NetworkIcon } from "@/Components/Networks/NetworkIcon";

const truncateDescription = (
    description: App.Data.Collections.CollectionFeaturedData["description"],
): string | null => {
    if (description !== null && description.length > 120) {
        return description.slice(0, 117) + "...";
    }

    return description;
};

const FeaturedCollectionInfo = ({ data }: { data: App.Data.Collections.CollectionFeaturedData }): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="left-0 top-0 z-10 w-full p-6 md-lg:p-8">
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

                    <div className="my-3 line-clamp-4 text-base font-medium leading-6 text-theme-secondary-700 dark:text-theme-dark-200 lg:line-clamp-2 lg:h-12">
                        {truncateDescription(data.description)}
                    </div>

                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between md-lg:flex-col md-lg:items-start">
                        <FeaturedCollectionStats
                            floorPrice={data.floorPrice}
                            floorPriceCurrency={data.floorPriceCurrency}
                            floorPriceDecimals={data.floorPriceDecimals}
                            nftsCount={data.nftsCount}
                            volume={data.volume}
                        />
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

                <FeaturedCollectionNfts nfts={data.nfts} />
            </div>
        </div>
    );
};

export const FeaturedCollectionsItem = ({
    data,
}: {
    data: App.Data.Collections.CollectionFeaturedData;
}): JSX.Element => (
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

        <FeaturedCollectionInfo data={data} />
    </div>
);
