import React from "react";
import { useTranslation } from "react-i18next";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { ExplorerChains } from "@/Utils/Explorer";
import { isTruthy } from "@/Utils/is-truthy";

interface Properties {
    type: "nft" | "collection";
    chainId: App.Enums.Chain;
    address: App.Data.Nfts.NftCollectionData["address"];
    nftId?: App.Data.Nfts.NftData["tokenNumber"];
}

const getNetworkName = (chainId: App.Enums.Chain): string | null => {
    switch (chainId) {
        case ExplorerChains.EthereumMainnet:
            return "ethereum";
        case ExplorerChains.PolygonMainnet:
            return "matic";
        default:
            return null;
    }
};

export const Marketplaces = ({ type, chainId, address, nftId }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const getMarketplaceUrl = (marketplace: string): string => {
        const networkName = getNetworkName(chainId);

        if (isTruthy(networkName)) {
            return t(`urls.marketplaces.${marketplace}.${type}`, {
                nftId,
                network: networkName,
                address,
            }).toLowerCase();
        }

        return "#";
    };

    return (
        <div
            className="-mb-1"
            data-testid="NftMarketplaces"
        >
            <ButtonLink
                data-testid={"NftMarketplaces__Opensea"}
                variant="icon"
                icon="OpenseaColor"
                className="transition-default h-7 w-7 border-none bg-transparent hover:bg-theme-secondary-300"
                href={getMarketplaceUrl("opensea")}
                iconSize="md"
                target="_blank"
            />
            <ButtonLink
                data-testid={"NftMarketplaces__Rarible"}
                variant="icon"
                icon="RaribleColor"
                className="h-7 w-7 border-none bg-transparent hover:bg-theme-secondary-300"
                href={getMarketplaceUrl("rarible")}
                iconSize="md"
                target="_blank"
            />
            <ButtonLink
                data-testid={"NftMarketplaces__Blur"}
                variant="icon"
                icon="BlurColor"
                className="h-7 w-7 border-none bg-transparent hover:bg-theme-secondary-300"
                href={getMarketplaceUrl("blur")}
                iconSize="md"
                target="_blank"
            />
            <ButtonLink
                data-testid={"NftMarketplaces__LooksRare"}
                variant="icon"
                icon="LooksRareColor"
                className="h-7 w-7 border-none bg-transparent hover:bg-theme-secondary-300"
                href={getMarketplaceUrl("looksrare")}
                iconSize="md"
                target="_blank"
            />
        </div>
    );
};
