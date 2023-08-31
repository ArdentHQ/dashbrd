import React from "react";
import { GalleryHeading } from "@/Components/Galleries/GalleryPage/GalleryHeading";
import { GalleryContext } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { render, screen } from "@/Tests/testing-library";

const nfts = new GalleryNftDataFactory().withImages().createMany(3);

describe("GalleryHeading", () => {
    it("should render", () => {
        render(
            <GalleryHeading
                collectionsCount={10}
                nftsCount={20}
                value={25482.58}
                name="Aping Around Town"
                currency="USD"
            />,
        );

        expect(screen.getByTestId("GalleryHeading")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryHeading__name")).toBeInTheDocument();

        expect(screen.getByText("Aping Around Town")).toBeTruthy();

        expect(screen.getByTestId("NftsCount")).toHaveTextContent("20");
        expect(screen.getByTestId("CollectionsCount")).toHaveTextContent("10");

        expect(screen.getByText("$25,482.58")).toBeTruthy();
    });

    it("should render with default values", () => {
        render(<GalleryHeading currency="USD" />);

        expect(screen.getByTestId("GalleryHeading")).toBeInTheDocument();
    });

    it("should render using editable context", () => {
        render(
            <GalleryContext.Provider
                value={{
                    nfts: {
                        selected: [...nfts, nfts[0]],
                        add: vi.fn(),
                        remove: vi.fn(),
                        update: vi.fn(),
                    },
                }}
            >
                <GalleryHeading currency="USD" />
            </GalleryContext.Provider>,
        );

        expect(screen.getByTestId("GalleryHeading")).toBeInTheDocument();

        expect(screen.getByTestId("NftsCount")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionsCount")).toBeInTheDocument();
    });

    it("should render without name", () => {
        render(
            <GalleryHeading
                collectionsCount={10}
                nftsCount={20}
                value={25482.58}
                currency="USD"
            />,
        );

        expect(screen.queryByTestId("GalleryHeading__name")).not.toBeInTheDocument();
    });
});
