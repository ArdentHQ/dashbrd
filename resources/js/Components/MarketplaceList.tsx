import React from "react";
import { useTranslation } from "react-i18next";
import { type IconName } from "./Icon";
import { ButtonLink } from "@/Components/Buttons/ButtonLink";
import { ExplorerChains } from "@/Utils/Explorer";

interface Properties {
    type: "nft" | "collection";
    chainId: App.Enums.Chain;
    address: App.Data.Nfts.NftCollectionData["address"];
    nftId?: App.Data.Nfts.NftData["tokenNumber"];
}

interface Provider {
    name: string;
    icon: IconName;
    slug: string;
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

const providers: Provider[] = [
    { name: "OpenSea", icon: "OpenseaColor", slug: "opensea" },
    { name: "Rarible", icon: "RaribleColor", slug: "rarible" },
    { name: "Blur", icon: "BlurColor", slug: "blur" },
    { name: "LooksRare", icon: "LooksRareColor", slug: "looksrare" },
];

export const MarketplaceList = ({ type, chainId, address, nftId }: Properties): JSX.Element => {
    const { t } = useTranslation();

    const getMarketplaceUrl = (marketplace: string): string => {
        const network = getNetworkName(chainId);

        if (network === null) {
            return "#";
        }

        return t(`urls.marketplaces.${marketplace}.${type}`, {
            nftId,
            network,
            address,
        }).toLowerCase();
    };

    return (
        <ul
            className="-mb-1 flex items-center"
            data-testid="NftMarketplaces"
        >
            {providers.map(({ name, icon, slug }) => (
                <li key={slug}>
                    <ButtonLink
                        data-testid={`NftMarketplaces__${name}`}
                        variant="icon"
                        icon={icon}
                        className="h-7 w-7 border-none bg-transparent hover:bg-theme-secondary-300"
                        href={getMarketplaceUrl(slug)}
                        iconSize="md"
                        target="_blank"
                    />
                </li>
            ))}
        </ul>
    );
};
