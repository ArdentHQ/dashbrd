import { render, screen } from "@testing-library/react";
import { t } from "i18next";
import { Marketplaces } from "./Marketplaces";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import { ExplorerChains } from "@/Utils/Explorer";

describe("Marketplaces", () => {
    const collection = new NFTCollectionFactory().create({
        chainId: ExplorerChains.EthereumMainnet,
    });

    const polygonCollection = new NFTCollectionFactory().create({
        chainId: ExplorerChains.PolygonMainnet,
    });

    const nft = new NftFactory().create({
        collection,
    });

    const polygonNft = new NftFactory().create({
        collection: polygonCollection,
    });

    it("should render", () => {
        render(
            <Marketplaces
                address={collection.address}
                nftId={nft.tokenNumber}
                chainId={collection.chainId}
                type="nft"
            />,
        );

        expect(screen.getByTestId("NftMarketplaces")).toBeInTheDocument();
    });

    it.each([
        [
            "NftMarketplaces__Opensea",
            t("urls.marketplaces.opensea.nft", {
                nftId: nft.tokenNumber,
                network: "ethereum",
                address: collection.address,
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__Rarible",
            t("urls.marketplaces.rarible.nft", {
                nftId: nft.tokenNumber,
                network: "ethereum",
                address: collection.address,
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__Blur",
            t("urls.marketplaces.blur.nft", {
                nftId: nft.tokenNumber,
                network: "ethereum",
                address: collection.address,
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__LooksRare",
            t("urls.marketplaces.looksrare.nft", {
                nftId: nft.tokenNumber,
                network: "ethereum",
                address: collection.address,
            }).toLowerCase(),
        ],
    ])("should render %s NFT url for ethereum", (testId, url) => {
        render(
            <Marketplaces
                address={collection.address}
                nftId={nft.tokenNumber}
                chainId={collection.chainId}
                type="nft"
            />,
        );

        expect(screen.getByTestId(testId)).toHaveAttribute("href", url);
    });

    it.each([
        [
            "NftMarketplaces__Opensea",
            t("urls.marketplaces.opensea.collection", {
                nftId: polygonNft.tokenNumber,
                network: "matic",
                address: polygonCollection.address,
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__Rarible",
            t("urls.marketplaces.rarible.collection", {
                nftId: polygonNft.tokenNumber,
                network: "matic",
                address: polygonCollection.address,
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__Blur",
            t("urls.marketplaces.blur.collection", {
                nftId: polygonNft.tokenNumber,
                network: "matic",
                address: polygonCollection.address,
            }).toLowerCase(),
        ],
        [
            "NftMarketplaces__LooksRare",
            t("urls.marketplaces.looksrare.collection", {
                nftId: polygonNft.tokenNumber,
                network: "matic",
                address: polygonCollection.address,
            }).toLowerCase(),
        ],
    ])("should render %s collection url for polygon", (testId, url) => {
        render(
            <Marketplaces
                address={polygonCollection.address}
                nftId={polygonNft.tokenNumber}
                chainId={polygonCollection.chainId}
                type="collection"
            />,
        );

        expect(screen.getByTestId(testId)).toHaveAttribute("href", url);
    });

    it("should render null url for unknown chain", () => {
        render(
            <Marketplaces
                address={polygonCollection.address}
                nftId={polygonNft.tokenNumber}
                chainId={0 as ExplorerChains}
                type="collection"
            />,
        );

        expect(screen.getByTestId("NftMarketplaces__Opensea")).toHaveAttribute("href", "#");
        expect(screen.getByTestId("NftMarketplaces__Rarible")).toHaveAttribute("href", "#");
        expect(screen.getByTestId("NftMarketplaces__Blur")).toHaveAttribute("href", "#");
        expect(screen.getByTestId("NftMarketplaces__LooksRare")).toHaveAttribute("href", "#");
    });
});
