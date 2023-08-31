import { useTranslation } from "react-i18next";
import { CollectionCarousel } from "./FeaturedCollectionsBanner.blocks";
import { Heading } from "@/Components/Heading";
import { tp } from "@/Utils/TranslatePlural";

export const FeaturedCollectionsBanner = ({
    collections = [],
}: {
    collections?: Array<Pick<App.Data.Nfts.NftCollectionData, "website" | "name" | "image">>;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            data-testid="FeaturedCollectionsBanner"
            className="flex flex-col items-center justify-between rounded-xl bg-gradient-to-r from-[#EEEEFF] via-[#FFEDED] to-[#EEEEFF] bg-200% px-6 py-[1.625em] lg:flex-row"
        >
            <div className="text-center lg:text-left">
                <Heading
                    data-testid="FeaturedCollectionsBanner__heading"
                    level={2}
                    className="whitespace-nowrap pt-0"
                >
                    <span className="text-theme-hint-600">{t("common.featured")}</span>

                    <span> {t("common.collections")}</span>
                </Heading>

                <p className="mt-0.5 text-xs font-medium text-theme-secondary-700 sm:text-sm">
                    {tp("pages.galleries.consists_of_collections", collections.length, {
                        count: collections.length,
                    })}
                </p>
            </div>

            <div className="overflow-auto">
                <CollectionCarousel
                    collections={collections}
                    className="md:mt-4 lg:mt-0"
                />
            </div>
        </div>
    );
};
