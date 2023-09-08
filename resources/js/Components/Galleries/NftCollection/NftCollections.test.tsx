import React from "react";
import { expect } from "vitest";
import { NftCollections } from "./NftCollections";
import { GalleryContext } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import { NftSelectionContext } from "@/Components/Galleries/Hooks/useNftSelectableContext";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("NftCollections", () => {
    const nfts = new GalleryNftDataFactory().withImages().createMany(6);

    const firstCollectionName = nfts[0].collectionName;
    const firstNftTestId = `NftImageGrid__image--${nfts[0].tokenNumber}`;
    const secondNftTestId = `NftImageGrid__image--${nfts[1].tokenNumber}`;

    const Providers = ({ children }: { children: React.ReactNode }): JSX.Element => (
        <GalleryContext.Provider
            value={{
                nfts: {
                    selected: [],
                    add: vi.fn(),
                    remove: vi.fn(),
                    update: vi.fn(),
                },
                nftLimit: 16,
            }}
        >
            <NftSelectionContext.Provider
                value={{
                    selected: [],
                    removeFromSelection: vi.fn(),
                    addToSelection: vi.fn(),
                    clearSelection: vi.fn(),
                }}
            >
                {children}
            </NftSelectionContext.Provider>
        </GalleryContext.Provider>
    );

    it("should render", () => {
        render(
            <Providers>
                <NftCollections
                    nfts={nfts}
                    allNftsLoaded={() => false}
                    loadMoreNfts={vi.fn()}
                    getLoadingNftsCount={() => 0}
                />
            </Providers>,
        );

        expect(screen.queryByTestId("NftCollections")).toBeInTheDocument();
        expect(screen.getByText(firstCollectionName)).toBeInTheDocument();
    });

    it("should expand & collapse a collection", async () => {
        render(
            <Providers>
                <NftCollections
                    nfts={nfts}
                    allNftsLoaded={() => false}
                    loadMoreNfts={vi.fn()}
                    getLoadingNftsCount={() => 0}
                />
                ,
            </Providers>,
        );

        expect(screen.queryByTestId("NftCollections")).toBeInTheDocument();
        expect(screen.getByText(firstCollectionName)).toBeInTheDocument();

        expect(screen.getAllByTestId("Accordion__item")).toHaveLength(6);

        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[0]);

        expect(screen.queryByTestId(firstNftTestId)).toBeInTheDocument();
        expect(screen.getByTestId(firstNftTestId)).toHaveAttribute("src", nfts[0].images.small);

        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[1]);

        expect(screen.queryByTestId(secondNftTestId)).toBeInTheDocument();
        expect(screen.getByTestId(secondNftTestId)).toHaveAttribute("src", nfts[1].images.small);

        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[0]);
        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[1]);

        expect(screen.queryByTestId(firstNftTestId)).not.toBeInTheDocument();
        expect(screen.queryByTestId(secondNftTestId)).not.toBeInTheDocument();
    });

    it("should toggle the 'Load More NFTs' button based on the loaded state", async () => {
        const allNftsLoaded = (nft: App.Data.Gallery.GalleryNftData): boolean => nft.id === nfts[0].id;

        render(
            <Providers>
                <NftCollections
                    nfts={nfts}
                    allNftsLoaded={allNftsLoaded}
                    loadMoreNfts={vi.fn()}
                    getLoadingNftsCount={() => 0}
                />
            </Providers>,
        );

        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[0]);
        expect(screen.queryByTestId("NftCollectionSlider__loadMoreNfts")).not.toBeInTheDocument();

        // close the first collection and open the second one
        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[0]);
        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[1]);
        expect(screen.getByTestId("NftCollectionSlider__loadMoreNfts")).toBeInTheDocument();
    });

    it("should load more NFTs when the `load More NFTs` button clicked", async () => {
        const loadMoreNftsMock = vi.fn();

        render(
            <Providers>
                <NftCollections
                    nfts={nfts}
                    allNftsLoaded={() => false}
                    loadMoreNfts={loadMoreNftsMock}
                    getLoadingNftsCount={() => 0}
                />
                ,
            </Providers>,
        );

        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[0]);
        await userEvent.click(screen.getByTestId("NftCollectionSlider__loadMoreNfts"));

        expect(loadMoreNftsMock).toHaveBeenCalledTimes(1);
        expect(loadMoreNftsMock).toHaveBeenCalledWith(nfts[0]);
    });

    it("should show skeletons when the `skeletonsCount` is set", async () => {
        const loadMoreNftsMock = vi.fn();

        render(
            <Providers>
                <NftCollections
                    nfts={nfts}
                    allNftsLoaded={() => false}
                    loadMoreNfts={loadMoreNftsMock}
                    getLoadingNftsCount={() => 0}
                    skeletonCount={3}
                />
                ,
            </Providers>,
        );

        await userEvent.click(screen.getAllByTestId("Accordion__item-header")[0]);
        await userEvent.click(screen.getByTestId("NftCollectionSlider__loadMoreNfts"));

        expect(screen.getAllByTestId("Collection_Skeleton").length).toBe(3);
    });
});
