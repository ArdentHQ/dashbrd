import React from "react";
import { CollectionImages } from "./CollectionImages";
import CollectionNftDataFactory from "@/Tests/Factories/Collections/CollectionNftDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("CollectionImages", () => {
    it("should render with less than max displayed images", () => {
        const nfts = new CollectionNftDataFactory().withImages().createMany(3);

        render(
            <CollectionImages
                nfts={nfts}
                nftsCount={nfts.length}
            />,
        );

        expect(screen.getByTestId("CollectionImages")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(3);
    });

    it("should render with max displayed images", () => {
        const nfts = new CollectionNftDataFactory().withImages().createMany(4);

        render(
            <CollectionImages
                nfts={nfts}
                nftsCount={nfts.length}
            />,
        );

        expect(screen.getByTestId("CollectionImages")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(4);
    });

    it("should render with more than displayed images", () => {
        const nfts = new CollectionNftDataFactory().withImages().createMany(6);

        const { container } = render(
            <CollectionImages
                nfts={nfts}
                nftsCount={nfts.length}
            />,
        );

        expect(screen.getByTestId("CollectionImages")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(4);

        expect(container).toHaveTextContent("+3");
    });

    it("should not render plus sign when only one image is displayed", () => {
        const nfts = new CollectionNftDataFactory().withImages().createMany(6);

        const { container } = render(
            <CollectionImages
                nfts={nfts}
                nftsCount={nfts.length}
                maxItems={1}
            />,
        );

        expect(screen.getByTestId("CollectionImages")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(1);

        expect(container).not.toHaveTextContent("+");
        expect(container).toHaveTextContent("6");
    });

    it("should render with missing images", () => {
        const nfts = new CollectionNftDataFactory().withoutImages().createMany(6);

        render(
            <CollectionImages
                nfts={nfts}
                nftsCount={nfts.length}
            />,
        );

        expect(screen.getByTestId("CollectionImages")).toBeInTheDocument();
        expect(screen.getAllByRole("img")).toHaveLength(4);
    });
});
