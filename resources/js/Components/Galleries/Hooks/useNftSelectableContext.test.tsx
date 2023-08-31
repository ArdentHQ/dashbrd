import React from "react";
import { NftSelectionHook, useNftSelectableContext } from "./useNftSelectableContext";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("useNftSelectableContext", () => {
    const nftTemplate = new GalleryNftDataFactory().create({
        name: "Test Nft Record",
    });

    const HookTestComponent = (): JSX.Element => {
        const { selected, addToSelection, removeFromSelection, clearSelection } = useNftSelectableContext();

        const nfts: JSX.Element[] = [];
        for (const [index, nft] of Object.entries(selected)) {
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
                            removeFromSelection(nft);
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
                        addToSelection({
                            ...nftTemplate,
                            tokenNumber: (selected.length + 1).toString(),
                        });
                    }}
                >
                    Add
                </button>

                <button
                    data-testid="TestNfts__ClearNfts"
                    onClick={() => {
                        clearSelection();
                    }}
                >
                    Clear
                </button>

                <div data-testid="TestNfts">{nfts}</div>
            </div>
        );
    };

    const Component = (): JSX.Element => (
        <NftSelectionHook>
            <HookTestComponent />
        </NftSelectionHook>
    );

    it("should throw exception if not inside context", () => {
        const originalError = console.error;
        console.error = vi.fn();

        const NoProviderComponent = (): JSX.Element => {
            useNftSelectableContext();

            return <div></div>;
        };

        expect(() => render(<NoProviderComponent />)).toThrowError(
            "useNftSelectableContext must be within NftSelectionContext.Provider",
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
        expect(screen.queryByText("Test Nft Record (2)")).not.toBeInTheDocument();
        expect(screen.getByText("Test Nft Record (3)")).toBeInTheDocument();
    });

    it("should clear selection", async () => {
        render(<Component />);

        expect(screen.queryAllByTestId("TestNfts__Entry")).toHaveLength(0);

        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));
        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));
        await userEvent.click(screen.getByTestId("TestNfts__AddNft"));

        expect(screen.getAllByTestId("TestNfts__Entry")).toHaveLength(3);
        expect(screen.getByText("Test Nft Record (1)")).toBeInTheDocument();
        expect(screen.getByText("Test Nft Record (2)")).toBeInTheDocument();
        expect(screen.getByText("Test Nft Record (3)")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("TestNfts__ClearNfts"));

        expect(screen.queryAllByTestId("TestNfts__Entry")).toHaveLength(0);
        expect(screen.queryByText("Test Nft Record (1)")).not.toBeInTheDocument();
        expect(screen.queryByText("Test Nft Record (2)")).not.toBeInTheDocument();
        expect(screen.queryByText("Test Nft Record (3)")).not.toBeInTheDocument();
    });

    it("should not add the same nfts to selection", async () => {
        const HookTestComponent = (): JSX.Element => {
            const { selected, addToSelection } = useNftSelectableContext();

            const nfts: JSX.Element[] = [];
            for (const [index, nft] of Object.entries(selected)) {
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
                            addToSelection({
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
            <NftSelectionHook>
                <HookTestComponent />
            </NftSelectionHook>,
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
