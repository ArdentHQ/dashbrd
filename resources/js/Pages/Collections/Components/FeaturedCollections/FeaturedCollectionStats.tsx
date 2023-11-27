import React from "react";
import { useTranslation } from "react-i18next";
import { GridHeader } from "@/Components/GridHeader";
import { FormatCrypto } from "@/Utils/Currency";

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
    nftsCount: number;
    volume: string | null;
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
                value={nftsCount}
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
                title={t("common.volume", { frequency: "" })}
                value={
                    <FormatCrypto
                        value={volume ?? "0"}
                        token={token}
                        maximumFractionDigits={2}
                    />
                }
            />
        </div>
    );
};
