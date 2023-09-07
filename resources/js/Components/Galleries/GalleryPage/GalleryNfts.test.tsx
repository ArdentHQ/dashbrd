import React from "react";
import { GalleryNfts } from "@/Components/Galleries/GalleryPage/GalleryNfts";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { render, screen } from "@/Tests/testing-library";

const nfts = new GalleryNftDataFactory().createMany(3);

describe("GalleryNfts", () => {
    it("should render", () => {
        render(<GalleryNfts nfts={nfts} />);

        expect(screen.getByTestId("GalleryNfts")).toBeInTheDocument();
    });
});
