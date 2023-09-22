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
        <Heading
            level={1}
            className="text-center sm:text-left"
        >
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
                        className="text-theme-primary-600"
                    />,
                ]}
            />
        </Heading>
    );
};
