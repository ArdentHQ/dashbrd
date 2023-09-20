import { router } from "@inertiajs/react";
import React from "react";
import { GalleryNftsNft } from "@/Components/Galleries/GalleryPage/GalleryNftsNft";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";

describe("GalleryNftsNft", () => {
    const nft = new GalleryNftDataFactory().withImages().create({
        name: "CrypToadz",
        floorPrice: "11000000000000000000",
        floorPriceCurrency: "eth",
        floorPriceDecimals: 18,
        chainId: 1,
    });

    const image = new Image();

    beforeAll(() => {
        vi.spyOn(window, "Image").mockImplementation(() => image);
    });

    it("should render with eth NFT", async () => {
        render(
            <GalleryNftsNft
                nft={nft}
                isSelected={false}
                onClick={vi.fn()}
            />,
        );

        expect(screen.getByTestId("GalleryCard")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryNftsNft__website")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__image")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__socials-opensea")).toHaveAttribute(
                "href",
                `https://opensea.io/assets/ethereum/${nft.tokenAddress}/${nft.tokenNumber}`,
            );
        });

        expect(nft.name).toBeDefined();
        assert(nft.name);

        expect(screen.getByTestId("GalleryCard")).not.toHaveClass("outline-theme-primary-300");
        expect(screen.getByTestId("GalleryNftsNft__price")).toHaveTextContent("11 ETH");
        expect(screen.getByTestId("GalleryNftsNft__name")).toHaveTextContent(nft.name);
    });

    it("should render selected", async () => {
        render(
            <GalleryNftsNft
                nft={nft}
                isSelected={true}
                onClick={vi.fn()}
            />,
        );

        expect(screen.getByTestId("GalleryCard")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryNftsNft__website")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__image")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__socials-opensea")).toHaveAttribute(
                "href",
                `https://opensea.io/assets/ethereum/${nft.tokenAddress}/${nft.tokenNumber}`,
            );
        });

        expect(screen.getByTestId("GalleryCard")).toHaveClass("outline-theme-primary-300");
    });

    it("should render without image", async () => {
        render(
            <GalleryNftsNft
                nft={{
                    ...nft,
                    images: { thumb: null, small: null, large: null },
                }}
                isSelected={false}
                onClick={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("GalleryNftsNft__image")).not.toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__socials-opensea")).toHaveAttribute(
                "href",
                `https://opensea.io/assets/ethereum/${nft.tokenAddress}/${nft.tokenNumber}`,
            );
        });
    });

    it("should render without name", () => {
        render(
            <GalleryNftsNft
                nft={{
                    ...nft,
                    name: null,
                }}
                isSelected={false}
                onClick={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("GalleryNftsNft__name")).not.toBeInTheDocument();
        expect(screen.queryByTestId("GalleryNftsNft__tokenNumber")).toBeInTheDocument();
    });

    it("should render without price and price currency", () => {
        render(
            <GalleryNftsNft
                nft={{
                    ...nft,
                    floorPrice: null,
                    floorPriceCurrency: null,
                    floorPriceDecimals: null,
                }}
                isSelected={false}
                onClick={vi.fn()}
            />,
        );

        expect(screen.getByTestId("GalleryNftsNft__price")).toHaveTextContent("0");
    });

    it("should render with collection image", async () => {
        const nft = new GalleryNftDataFactory().withCollectionImage().create({ chainId: 1 });

        render(
            <GalleryNftsNft
                nft={nft}
                isSelected={false}
                onClick={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("GalleryNftsNft__collection_image")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__socials-opensea")).toHaveAttribute(
                "href",
                `https://opensea.io/assets/ethereum/${nft.tokenAddress}/${nft.tokenNumber}`,
            );
        });
    });

    it("should render without collection image", () => {
        const nft = new GalleryNftDataFactory().withoutCollectionImage().create();

        render(
            <GalleryNftsNft
                nft={nft}
                isSelected={false}
                onClick={vi.fn()}
            />,
        );

        expect(screen.queryByTestId("GalleryNftsNft__collection_image")).not.toBeInTheDocument();
    });

    it.each([true, false])("should execute onClick callback with isSelected = %s", async (isSelected) => {
        const onClick = vi.fn();
        render(
            <GalleryNftsNft
                nft={nft}
                isSelected={isSelected}
                onClick={onClick}
            />,
        );

        expect(screen.getByTestId("GalleryCard")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryNftsNft__website")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__image")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__socials-opensea")).toHaveAttribute(
                "href",
                `https://opensea.io/assets/ethereum/${nft.tokenAddress}/${nft.tokenNumber}`,
            );
        });

        await userEvent.click(screen.getByTestId("GalleryCard"));

        expect(onClick).toHaveBeenCalledWith(isSelected ? undefined : `${nft.tokenNumber}_${nft.id}`);
    });

    it("should render with polygon NFT", async () => {
        const polygonNft = new GalleryNftDataFactory().withImages().create({
            name: "CrypToadz",
            floorPrice: "11000000000000000000",
            floorPriceCurrency: "eth",
            floorPriceDecimals: 18,
            chainId: 137,
        });

        render(
            <GalleryNftsNft
                nft={polygonNft}
                isSelected={false}
                onClick={vi.fn()}
            />,
        );

        expect(screen.getByTestId("GalleryCard")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryNftsNft__website")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__image")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByTestId("GalleryNftsNft__socials-opensea")).toHaveAttribute(
                "href",
                `https://opensea.io/assets/matic/${polygonNft.tokenAddress}/${polygonNft.tokenNumber}`,
            );
        });

        expect(nft.name).toBeDefined();
        assert(nft.name);

        expect(screen.getByTestId("GalleryCard")).not.toHaveClass("lg:outline-theme-primary-300");
        expect(screen.getByTestId("GalleryNftsNft__price")).toHaveTextContent("11 ETH");
        expect(screen.getByTestId("GalleryNftsNft__name")).toHaveTextContent(nft.name);
    });

    it("should redirect to collection details page when clicking the collection name", async () => {
        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        render(
            <GalleryNftsNft
                nft={nft}
                isSelected={true}
                onClick={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByTestId("GalleryNftsNft__website"));

        expect(routerSpy).toHaveBeenCalled();
    });
});
