import { render, screen } from "@testing-library/react";
import { t } from "i18next";
import { MarketplaceList } from "./MarketplaceList";
import { type ExplorerChains } from "@/Utils/Explorer";

describe("MarketplaceList", () => {
    const eth = [
        [
            "NftMarketplaces__OpenSea",
            t("urls.marketplaces.opensea.nft", {
                nftId: "10",
                network: "ethereum",
                address: "0x123",
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__Rarible",
            t("urls.marketplaces.rarible.nft", {
                nftId: "10",
                network: "ethereum",
                address: "0x123",
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__Blur",
            t("urls.marketplaces.blur.nft", {
                nftId: "10",
                network: "ethereum",
                address: "0x123",
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__LooksRare",
            t("urls.marketplaces.looksrare.nft", {
                nftId: "10",
                network: "ethereum",
                address: "0x123",
            }).toLowerCase(),
        ],
    ];

    const polygon = [
        [
            "NftMarketplaces__OpenSea",
            t("urls.marketplaces.opensea.collection", {
                nftId: "20",
                network: "matic",
                address: "0x345",
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__Rarible",
            t("urls.marketplaces.rarible.collection", {
                nftId: "20",
                network: "matic",
                address: "0x345",
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__Blur",
            t("urls.marketplaces.blur.collection", {
                nftId: "20",
                network: "matic",
                address: "0x345",
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__LooksRare",
            t("urls.marketplaces.looksrare.collection", {
                nftId: "20",
                network: "matic",
                address: "0x345",
            }).toLowerCase(),
        ],
    ];

    it("should render", () => {
        render(
            <MarketplaceList
                address="0x123"
                nftId="10"
                chainId={1}
                type="nft"
            />,
        );

        expect(screen.getByTestId("NftMarketplaces")).toBeInTheDocument();
    });

    it.each(eth)("should render %s NFT url for ethereum", (testId, url) => {
        render(
            <MarketplaceList
                address="0x123"
                nftId="10"
                chainId={1}
                type="nft"
            />,
        );

        expect(screen.getByTestId(testId)).toHaveAttribute("href", url);
    });

    it.each(polygon)("should render %s collection url for polygon", (testId, url) => {
        render(
            <MarketplaceList
                address="0x345"
                nftId="20"
                chainId={137}
                type="collection"
            />,
        );

        expect(screen.getByTestId(testId)).toHaveAttribute("href", url);
    });

    it("should render null url for unknown chain", () => {
        render(
            <MarketplaceList
                address="0x123"
                nftId="10"
                chainId={0 as ExplorerChains}
                type="collection"
            />,
        );

        expect(screen.getByTestId("NftMarketplaces__OpenSea")).toHaveAttribute("href", "#");
        expect(screen.getByTestId("NftMarketplaces__Rarible")).toHaveAttribute("href", "#");
        expect(screen.getByTestId("NftMarketplaces__Blur")).toHaveAttribute("href", "#");
        expect(screen.getByTestId("NftMarketplaces__LooksRare")).toHaveAttribute("href", "#");
    });
});
