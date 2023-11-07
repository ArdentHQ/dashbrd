import { useTranslation } from "react-i18next";
import { CollectionCarousel } from "./FeaturedCollectionsBanner.blocks";
import { Heading } from "@/Components/Heading";
import { tp } from "@/Utils/TranslatePlural";

export const FeaturedCollectionsBanner = ({
    collections = [],
    subtitle,
}: {
    collections?: Array<Pick<App.Data.Nfts.NftCollectionData, "name" | "image" | "slug">>;
    subtitle?: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div
            data-testid="FeaturedCollectionsBanner"
            className="flex flex-col items-center justify-between rounded-xl bg-theme-secondary-100 px-6 py-[1.625em] dark:bg-theme-dark-800 lg:flex-row"
        >
            <div className="text-center lg:text-left">
                <Heading
                    data-testid="FeaturedCollectionsBanner__heading"
                    level={2}
                    className="whitespace-nowrap pt-0"
                >
                    <span className="text-theme-primary-600 dark:text-theme-primary-400">{t("common.featured")}</span>

                    <span> {t("common.collections")}</span>
                </Heading>

                <p className="mt-0.5 text-xs font-medium text-theme-secondary-700 dark:text-theme-dark-200 sm:text-sm">
                    {subtitle ??
                        tp("pages.galleries.consists_of_collections", collections.length, {
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
