import { render, screen } from "@testing-library/react";
import { Marketplaces } from "./Marketplaces";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import { ExplorerChains } from "@/Utils/Explorer";

describe("Marketplaces", () => {
    const collection = new NFTCollectionFactory().create({
        chainId: ExplorerChains.EthereumMainnet,
    });

    const nft = new NftFactory().create({
        collection,
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

    it("should render urls for NFTs", () => {});

    it.each(
        ["NftMarketplaces__Opensea"],
        ["NftMarketplaces__Rarible"],
        ["NftMarketplaces__Blur"],
        ["NftMarketplaces__LooksRare"],
    );
});
