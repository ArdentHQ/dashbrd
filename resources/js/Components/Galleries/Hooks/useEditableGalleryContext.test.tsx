import React from "react";
import { EditableGalleryHook, useEditableGalleryContext } from "./useEditableGalleryContext";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("useNftSelectableContext", () => {
    const nftTemplate = new GalleryNftDataFactory().create({
        name: "Test Nft Record",
    });

    const HookTestComponent = (): JSX.Element => {
        const { nfts: galleryNfts } = useEditableGalleryContext();

        const nfts: JSX.Element[] = [];
        for (const [index, nft] of Object.entries(galleryNfts.selected)) {
            nfts.push(
                <div
                    key={`NftEntry--${index}`}
                    data-testid="TestNfts__Entry"
                >
                    <span>
                        {nft.name} ({nft.tokenNumber})
                    </span>

                    <button
                        data-testid={`TestNfts__RemoveNft--${index}`}
                        onClick={() => {
                            galleryNfts.remove(nft);
                        }}
                    >
                        Remove
                    </button>
                </div>,
            );
        }

        return (
            <div>
                <button
                    data-testid="TestNfts__AddNft"
                    onClick={() => {
                        galleryNfts.add({
                            ...nftTemplate,
                            tokenNumber: (galleryNfts.selected.length + 1).toString(),
                        });
                    }}
                >
                    Add
                </button>

                <div data-testid="TestNfts">{nfts}</div>
            </div>
        );
    };

    const Component = (): JSX.Element => (
        <EditableGalleryHook nftLimit={16}>
            <HookTestComponent />
        </EditableGalleryHook>
    );

    it("should throw exception if not inside context", () => {
        const originalError = console.error;
        console.error = vi.fn();

        const NoProviderComponent = (): JSX.Element => {
            useEditableGalleryContext();

            return <div></div>;
        };

        expect(() => render(<NoProviderComponent />)).toThrowError(
            "useEditableGalleryContext must be within GalleryContext.Provider",
        );

        console.error = originalError;
    });

    it("should add nfts to selection", async () => {
        render(<Component />);

        expect(screen.queryAllByTestId("TestNfts__Entry")).toHaveLength(0);

        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));

        expect(screen.getAllByTestId("TestNfts__Entry")).toHaveLength(1);
        expect(screen.getByText("Test Nft Record (1)")).toBeInTheDocument();
    });

    it("should not add nfts to selection if already have 16 items", async () => {
        render(<Component />);

        expect(screen.queryAllByTestId("TestNfts__Entry")).toHaveLength(0);

        for (let index = 0; index < 16; index++) {
            await userEvent.click(screen.getByTestId("TestNfts__AddNft"));
        }

        expect(screen.getAllByTestId("TestNfts__Entry")).toHaveLength(16);

        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));

        expect(screen.getAllByTestId("TestNfts__Entry")).toHaveLength(16);
    });

    it("should remove nfts from selection", async () => {
        render(<Component />);

        expect(screen.queryAllByTestId("TestNfts__Entry")).toHaveLength(0);

        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));
        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));
        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));

        expect(screen.getAllByTestId("TestNfts__Entry")).toHaveLength(3);
        expect(screen.getByText("Test Nft Record (1)")).toBeInTheDocument();
        expect(screen.getByText("Test Nft Record (2)")).toBeInTheDocument();
        expect(screen.getByText("Test Nft Record (3)")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("TestNfts__RemoveNft--1"));

        expect(screen.getAllByTestId("TestNfts__Entry")).toHaveLength(2);
        expect(screen.getByText("Test Nft Record (1)")).toBeInTheDocument();
        expect(screen.getByText("Test Nft Record (3)")).toBeInTheDocument();
    });

    it("should not add the same nfts to selection", async () => {
        const HookTestComponent = (): JSX.Element => {
            const { nfts: galleryNfts } = useEditableGalleryContext();

            const nfts: JSX.Element[] = [];
            for (const [index, nft] of Object.entries(galleryNfts.selected)) {
                nfts.push(
                    <div
                        key={`NftEntry--${index}`}
                        data-testid="TestNfts__Entry"
                    >
                        <span>
                            {nft.name} ({nft.tokenNumber})
                        </span>
                    </div>,
                );
            }

            return (
                <div>
                    <button
                        data-testid="TestNfts__AddNft"
                        onClick={() => {
                            galleryNfts.add({
                                ...nftTemplate,
                                tokenNumber: "0",
                            });
                        }}
                    >
                        Add
                    </button>

                    <div data-testid="TestNfts">{nfts}</div>
                </div>
            );
        };

        render(
            <EditableGalleryHook nftLimit={16}>
                <HookTestComponent />
            </EditableGalleryHook>,
        );

        expect(screen.queryAllByTestId("TestNfts__Entry")).toHaveLength(0);

        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));

        expect(screen.getAllByTestId("TestNfts__Entry")).toHaveLength(1);
        expect(screen.getByText("Test Nft Record (0)")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));

        expect(screen.getAllByTestId("TestNfts__Entry")).toHaveLength(1);
        expect(screen.getByText("Test Nft Record (0)")).toBeInTheDocument();
    });
});
