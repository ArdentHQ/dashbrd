import { router } from "@inertiajs/react";
import React from "react";
import { NftHeader } from "./NftHeader";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import NftFactory from "@/Tests/Factories/Nfts/NftFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";
import NftWalletFactory from "@/Tests/Factories/Nfts/NftWalletFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("NftHeader", () => {
    it("should render", () => {
        const nft = new NftFactory().withWallet().create({
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<NftHeader nft={nft} />);

        expect(screen.getByTestId("NftHeader__collectionImage")).toBeInTheDocument();
        expect(screen.getByTestId("NftHeader__collectionName")).toBeInTheDocument();
        expect(screen.getByTestId("NftHeader__heading")).toBeInTheDocument();
        expect(screen.getByTestId("NftHeader__walletAddress")).toBeInTheDocument();
    });

    it("shows NA label if no wallet", () => {
        const nft = new NftFactory().withoutWallet().create();

        render(<NftHeader nft={nft} />);

        expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("hide collection image if is null", () => {
        const nft = new NftFactory().withWallet().create({
            collection: new NFTCollectionFactory().withoutImage().create(),
        });

        render(<NftHeader nft={nft} />);

        expect(screen.queryByTestId("NftHeader__collectionImage")).not.toBeInTheDocument();
    });

    it("visits the collection page on click", async () => {
        const nft = new NftFactory().withWallet().create();

        render(<NftHeader nft={nft} />);

        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        await userEvent.click(screen.getByTestId("NftHeader__collectionName"));
        expect(routerSpy).toBeCalledTimes(1);
    });

    it("should use polygon url for address", () => {
        const wallet = new NftWalletFactory().create();

        const nft = new NftFactory().withWallet().create({
            wallet,
        });

        nft.collection.chainId = 137;

        render(<NftHeader nft={nft} />);

        expect(screen.getByTestId("NftHeader__walletAddress")).toHaveAttribute(
            "href",
            `https://polygonscan.com/address/${wallet.address}`,
        );
    });

    it("should use ethereum url for address", () => {
        const wallet = new NftWalletFactory().create();

        const nft = new NftFactory().withWallet().create({
            wallet,
        });

        nft.collection.chainId = 1;

        render(<NftHeader nft={nft} />);

        expect(screen.getByTestId("NftHeader__walletAddress")).toHaveAttribute(
            "href",
            `https://etherscan.io/address/${wallet.address}`,
        );
    });
});
