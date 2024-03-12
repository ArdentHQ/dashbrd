import React from "react";
import { useTranslation } from "react-i18next";
import { GridHeader } from "@/Components/GridHeader";
import { FormatCrypto } from "@/Utils/Currency";
import { formatNumbershort } from "@/Utils/format-number";

export const FeaturedCollectionStats = ({
    floorPrice,
    floorPriceCurrency,
    floorPriceDecimals,
    nftsCount,
    volume,
}: {
    floorPrice: string | null;
    floorPriceCurrency: string | null;
    floorPriceDecimals: number | null;
    nftsCount: number | null;
    volume: App.Data.VolumeData;
}): JSX.Element => {
    const { t } = useTranslation();

    const token: Pick<App.Data.Token.TokenData, "symbol" | "name" | "decimals"> = {
        name: "",
        symbol: floorPriceCurrency ?? "",
        decimals: floorPriceDecimals ?? 18,
    };

    return (
        <div className="flex flex-row items-center justify-start">
            <GridHeader
                className="!px-0"
                wrapperClassName="w-fit"
                title={t("common.nfts")}
                value={nftsCount !== null ? formatNumbershort(nftsCount) : null}
            />
            <div className="mx-4 h-8 w-px bg-theme-secondary-300 dark:bg-theme-dark-700 sm:mx-6" />

            <GridHeader
                className="!px-0"
                wrapperClassName="w-fit"
                title={t("common.floor_price")}
                value={
                    <FormatCrypto
                        value={floorPrice ?? "0"}
                        token={token}
                    />
                }
            />

            <div className="mx-4 h-8 w-px bg-theme-secondary-300 dark:bg-theme-dark-700 sm:mx-6" />

            <GridHeader
                className="!px-0"
                wrapperClassName="w-fit"
                title={t("common.volume_total")}
                value={
                    <FormatCrypto
                        value={volume.value ?? "0"}
                        token={{
                            name: volume.currency,
                            symbol: volume.currency,
                            decimals: volume.decimals,
                        }}
                        maximumFractionDigits={2}
                    />
                }
            />
        </div>
    );
};
