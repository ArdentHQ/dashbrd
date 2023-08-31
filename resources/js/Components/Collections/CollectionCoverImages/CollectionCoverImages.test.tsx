import React from "react";
import { CollectionCoverImages } from "./CollectionCoverImages";
import CollectionNftDataFactory from "@/Tests/Factories/Collections/CollectionNftDataFactory";
import NftImagesDataFactory from "@/Tests/Factories/Nfts/NftImagesDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("CollectionCoverImages", () => {
    it("should render only cover", () => {
        const nfts = new CollectionNftDataFactory().withImages().createMany(1);

        render(<CollectionCoverImages nfts={nfts} />);

        expect(screen.getByTestId("CollectionCoverImages")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__cover")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(1);
    });

    it("should render two images", () => {
        const nfts = new CollectionNftDataFactory().createMany(2, {
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<CollectionCoverImages nfts={nfts} />);

        expect(screen.getByTestId("CollectionCoverImages")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__cover")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__second")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(2);
    });

    it("should render three images", () => {
        const nfts = new CollectionNftDataFactory().createMany(3, {
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<CollectionCoverImages nfts={nfts} />);

        expect(screen.getByTestId("CollectionCoverImages")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__cover")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__second")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__third")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(3);
    });

    it("should render more than three images with overlay indicator", () => {
        const nfts = new CollectionNftDataFactory().createMany(4, {
            images: new NftImagesDataFactory().withValues().create(),
        });

        render(<CollectionCoverImages nfts={nfts} />);

        expect(screen.getByTestId("CollectionCoverImages")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__cover")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__second")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__third")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCoverImages__more")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(3);
    });
});
