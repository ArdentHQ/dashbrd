import { Trans, useTranslation } from "react-i18next";
import { Heading } from "@/Components/Heading";
import { formatFiat } from "@/Utils/Currency";
import { tp } from "@/Utils/TranslatePlural";

export const CollectionsHeading = ({
    value,
    collectionsCount,
    nftsCount,
    currency,
}: {
    collectionsCount: number;
    nftsCount: number;
    value: number | null;
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
                    nftsCount,
                    collectionsCount,
                    collections: tp("common.n_collections", collectionsCount),
                    nfts: tp("common.n_nfts", nftsCount),
                    worth: formatFiat({
                        currency,
                        value: value !== null ? value.toString() : "0",
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
