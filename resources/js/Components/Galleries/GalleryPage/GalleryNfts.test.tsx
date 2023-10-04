import React from "react";
import { GalleryNfts } from "@/Components/Galleries/GalleryPage/GalleryNfts";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

const nfts = new GalleryNftDataFactory().createMany(3);

describe("GalleryNfts", () => {
    it("should render", () => {
        render(<GalleryNfts nfts={nfts} />);

        expect(screen.getByTestId("GalleryNfts")).toBeInTheDocument();
    });

    it("should select and deselect nft", async () => {
        render(<GalleryNfts nfts={nfts} />);

        expect(screen.getByTestId("GalleryNfts")).toBeInTheDocument();

        expect(screen.getAllByTestId("GalleryCard")[0]).not.toHaveClass("outline-theme-primary-300");

        await userEvent.click(screen.getAllByTestId("GalleryCard")[0]);

        expect(screen.getAllByTestId("GalleryCard")[0]).toHaveClass("outline-theme-primary-300");

        await userEvent.click(screen.getAllByTestId("GalleryCard")[0]);

        expect(screen.getAllByTestId("GalleryCard")[0]).not.toHaveClass("outline-theme-primary-300");
    });
});
