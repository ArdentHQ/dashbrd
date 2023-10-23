import { Trans, useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { formatFiat } from "@/Utils/Currency";
import { tp } from "@/Utils/TranslatePlural";

export const CollectionsHeading = ({
    stats,
    currency,
}: {
    stats: App.Data.Collections.CollectionStatsData;
    currency: string;
}): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="text-left">
            <div className="flex w-full flex-row items-center justify-between gap-3 md:justify-start">
                <Heading
                    level={1}
                    className="dark:text-theme-dark-50"
                >
                    {t("common.my_collection")}
                </Heading>
            </div>
            <span className="mt-1 block text-sm font-medium leading-5 text-theme-secondary-700 dark:text-theme-dark-200 sm:text-base">
                <Trans
                    i18nKey="pages.collections.header_title"
                    values={{
                        nftsCount: stats.nfts,
                        collectionsCount: stats.collections,
                        collections: tp("common.n_collections", stats.collections),
                        nfts: tp("common.n_nfts", stats.nfts),
                        worth: formatFiat({
                            currency,
                            value: stats.value !== null ? stats.value.toString() : "0",
                            t,
                        }),
                    }}
                    components={[
                        <span
                            key="0"
                            className="text-theme-primary-600 dark:text-theme-primary-400"
                        />,
                    ]}
                />
            </span>
        </div>
    );
};
