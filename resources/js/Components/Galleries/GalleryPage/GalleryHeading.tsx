import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { hasEditableContext, useEditableGalleryContext } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import { Heading } from "@/Components/Heading";
import { FormatFiat } from "@/Utils/Currency";
import { isTruthy } from "@/Utils/is-truthy";
import { tp } from "@/Utils/TranslatePlural";

interface HeaderData {
    nftsCount: number;
    collectionsCount: number;
}

export const GalleryHeading = ({
    collectionsCount,
    nftsCount,
    value,
    name,
    currency,
}: {
    collectionsCount?: number;
    nftsCount?: number;
    value?: number | null;
    name?: string;
    currency: string;
}): JSX.Element => {
    const { t } = useTranslation();

    let headerData: HeaderData = {
        collectionsCount: collectionsCount ?? 0,
        nftsCount: nftsCount ?? 0,
    };

    if (hasEditableContext()) {
        const { nfts: galleryNfts } = useEditableGalleryContext();
        headerData = useMemo<HeaderData>(() => {
            const collections = new Set<string>();
            for (const nft of galleryNfts.selected) {
                if (collections.has(nft.tokenAddress)) {
                    continue;
                }

                collections.add(nft.tokenAddress);
            }

            return {
                nftsCount: galleryNfts.selected.length,
                collectionsCount: collections.size,
            };
        }, [galleryNfts.selected]);
    }

    return (
        <div
            data-testid="GalleryHeading"
            className="text-center"
        >
            {name !== undefined && (
                <Heading
                    data-testid="GalleryHeading__name"
                    level={1}
                    className="break-words"
                >
                    {name}
                </Heading>
            )}

            <div className="mt-2 text-sm font-medium leading-6 text-theme-secondary-900 md:text-base md:leading-7 lg:text-xl lg:leading-[1.875rem]">
                <span
                    className="text-theme-hint-600"
                    data-testid="NftsCount"
                >
                    {headerData.nftsCount}{" "}
                </span>
                <span>{tp("pages.galleries.nfts_count_simple", headerData.nftsCount)}</span>

                <span className="lowercase"> {t("pages.galleries.from")} </span>

                <span
                    className="text-theme-hint-600"
                    data-testid="CollectionsCount"
                >
                    {headerData.collectionsCount}{" "}
                </span>
                <span>{tp("pages.galleries.collections_count_simple", headerData.collectionsCount)}</span>

                {isTruthy(value) && (
                    <>
                        <span>, {t("pages.galleries.valued_at")}</span>

                        <span>
                            <span className="text-theme-hint-600">
                                &nbsp;
                                <FormatFiat
                                    value={value.toString()}
                                    currency={currency}
                                />
                            </span>
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};
