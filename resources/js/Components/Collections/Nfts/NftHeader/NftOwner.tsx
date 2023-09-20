import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@/Components/Link";
import { useNetwork } from "@/Hooks/useNetwork";
import { formatAddress } from "@/Utils/format-address";
import { TruncateMiddle } from "@/Utils/TruncateMiddle";

interface Properties {
    nft: App.Data.Nfts.NftData;
}

export const NftOwner = ({ nft }: Properties): JSX.Element => {
    const { t } = useTranslation();
    const { isPolygon } = useNetwork();
    const address = nft.wallet != null ? formatAddress(nft.wallet.address) : null;

    const ownerUrl = useMemo(() => {
        if (nft.wallet === null) {
            return null;
        }

        return t(`urls.explorers.${isPolygon(nft.collection.chainId) ? "polygonscan" : "etherscan"}.addresses`, {
            address,
        });
    }, [nft, t]);

    return (
        <div className="flex text-sm font-medium text-theme-secondary-700">
            {t("pages.nfts.owned_by") + " "}

            {nft.wallet !== null && ownerUrl !== null && address !== null ? (
                <Link
                    data-testid="NftOwner__walletAddress"
                    href={ownerUrl}
                    external
                    showExternalIcon={true}
                    className="ml-1 flex flex-row items-center"
                >
                    <span className="text-theme-hint-600">
                        <TruncateMiddle
                            length={8}
                            text={address}
                        />
                    </span>
                </Link>
            ) : (
                <span className="ml-1">{t("common.na")}</span>
            )}
        </div>
    );
};
