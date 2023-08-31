import React, { useState } from "react";
import { expect } from "vitest";
import { GalleryContext } from "@/Components/Galleries/Hooks/useEditableGalleryContext";
import { type CollectionsPageMeta, GalleryNfts } from "@/Components/Galleries/Hooks/useGalleryNftsContext";
import { NftSelectionHook } from "@/Components/Galleries/Hooks/useNftSelectableContext";
import { NftCollectionSlider } from "@/Components/Galleries/NftCollection/NftCollectionSlider";
import { SliderContext, useSliderContext } from "@/Components/Slider";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import { requestMock, requestMockOnce, server } from "@/Tests/Mocks/server";
import { SampleLastPageMeta, SamplePageMeta } from "@/Tests/SampleData";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";

describe("NftCollectionSlider", () => {
    const baseUrl = SamplePageMeta.paginated.links[0].url;

    let TestButton: () => JSX.Element;

    let Component: ({
        collectionsOverride,
        collectionCount,
        meta,
    }: {
        collectionsOverride?: App.Data.Gallery.GalleryNftData[];
        collectionCount?: number;
        meta?: Partial<CollectionsPageMeta>;
    }) => JSX.Element;

    const addToGalleryMock = vi.fn();
    const removeFromGalleryMock = vi.fn();

    const nfts = [
        new GalleryNftDataFactory().withImages().create({
            collectionName: "CrypToadz by GREMPLIN",
        }),
        new GalleryNftDataFactory().withImages().create({
            collectionName: "AlphaDogs",
        }),
        new GalleryNftDataFactory().withImages().create({
            collectionName: "Blitmap",
        }),
        new GalleryNftDataFactory().withImages().create({
            collectionName: "goblintown.wtf",
        }),
        new GalleryNftDataFactory().withImages().create({
            collectionName: "CryptoDickbutts",
        }),
        new GalleryNftDataFactory().withImages().create({
            collectionName: "CryptoDickbutts",
        }),
        new GalleryNftDataFactory().withImages().create({
            collectionName: "tiny dinos (eth)",
        }),
    ];

    const collectionName = "CrypToadz by GREMPLIN";
    const secondCollectionName = "AlphaDogs";
    const accordionHeader = "Accordion__item-header";
    const firstNft = `NftImageGrid__element--${nfts[0].tokenNumber}`;
    const secondNft = `NftImageGrid__element--${nfts[1].tokenNumber}`;

    const collectionsOverride = [...nfts] as App.Data.Gallery.GalleryNftData[];

    beforeEach(() => {
        server.use(
            requestMock(`${baseUrl}/collections`, {
                nfts,
                collections: {
                    paginated: {
                        data: [],
                        ...SamplePageMeta.paginated,
                    },
                },
            }),
        );

        // eslint-disable-next-line react/display-name
        TestButton = (): JSX.Element => {
            const { setOpen } = useSliderContext();

            return (
                <div
                    data-testid="TestButton"
                    onClick={() => {
                        setOpen(true);
                    }}
                />
            );
        };

        // eslint-disable-next-line react/display-name
        Component = ({
            collectionsOverride,
            collectionCount,
            meta,
        }: {
            collectionsOverride?: App.Data.Gallery.GalleryNftData[];
            collectionCount?: number;
            meta?: Partial<CollectionsPageMeta>;
        }): JSX.Element => {
            const [isSliderOpen, setSliderOpen] = useState(false);

            return (
                <SliderContext.Provider value={{ isOpen: isSliderOpen, setOpen: setSliderOpen }}>
                    <GalleryContext.Provider
                        value={{
                            nfts: {
                                selected: [],
                                update: vi.fn(),
                                add: addToGalleryMock,
                                remove: removeFromGalleryMock,
                            },
                        }}
                    >
                        <GalleryNfts
                            nfts={collectionsOverride ?? nfts}
                            pageMeta={{
                                first_page_url: `${baseUrl}/collections?page=1`,
                                next_page_url: `${baseUrl}/collections?page=1`,
                                total: collectionCount ?? 7,
                                per_page: 5,
                                ...meta,
                            }}
                        >
                            <NftSelectionHook>
                                <NftCollectionSlider />
                                <TestButton />
                            </NftSelectionHook>
                        </GalleryNfts>
                    </GalleryContext.Provider>
                </SliderContext.Provider>
            );
        };
    });

    it("should render unopened", () => {
        render(<Component />);

        expect(screen.queryByTestId("NftCollectionSlider")).not.toBeInTheDocument();
        expect(screen.queryByText(collectionName)).not.toBeInTheDocument();
        expect(screen.queryByText("1 NFT")).not.toBeInTheDocument();
    });

    it("should open", async () => {
        render(<Component />);

        expect(screen.queryByTestId("NftCollectionSlider")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("TestButton"));

        expect(screen.getByText(collectionName)).toBeInTheDocument();
    });

    it("should close", async () => {
        render(<Component />);

        await userEvent.click(screen.getByTestId("TestButton"));

        expect(screen.getByText(collectionName)).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Slider__closeButton_desktop"));

        expect(screen.queryByText(collectionName)).not.toBeInTheDocument();
    });

    it("should add nfts", async () => {
        render(<Component />);

        await userEvent.click(screen.getByTestId("TestButton"));
        await userEvent.click(screen.getAllByTestId(accordionHeader)[0]);
        await userEvent.click(screen.getByTestId(firstNft));
        await userEvent.click(screen.getByTestId("NftCollectionSlider__add"));

        expect(addToGalleryMock).toHaveBeenCalledWith(nfts[0]);
        expect(removeFromGalleryMock).not.toHaveBeenCalledWith();
    });

    it("should allow deselecting nfts", async () => {
        render(<Component collectionsOverride={nfts} />);

        await userEvent.click(screen.getByTestId("TestButton"));
        await userEvent.click(screen.getAllByTestId(accordionHeader)[0]);
        await userEvent.click(screen.getByTestId(firstNft));
        await userEvent.click(screen.getAllByTestId(accordionHeader)[1]);
        await userEvent.click(screen.getByTestId(secondNft));
        await userEvent.click(screen.getByTestId(firstNft));
        await userEvent.click(screen.getByTestId("NftCollectionSlider__add"));

        expect(addToGalleryMock).toHaveBeenCalledWith(nfts[1]);
        expect(removeFromGalleryMock).not.toHaveBeenCalledWith();
    });

    it("should not add nfts when cancelling", async () => {
        render(<Component />);

        await userEvent.click(screen.getByTestId("TestButton"));
        await userEvent.click(screen.getAllByTestId(accordionHeader)[0]);
        await userEvent.click(screen.getByTestId(firstNft));
        await userEvent.click(screen.getByTestId("NftCollectionSlider__cancel"));

        expect(addToGalleryMock).not.toHaveBeenCalledWith();
        expect(removeFromGalleryMock).not.toHaveBeenCalledWith();
    });

    it("should filter the collections", async () => {
        server.resetHandlers();

        server.use(
            requestMockOnce(`${baseUrl}/collections`, {
                nfts,
                collections: {
                    paginated: {
                        data: [],
                        ...SamplePageMeta.paginated,
                    },
                },
            }),
        );

        const component = render(<Component collectionsOverride={collectionsOverride} />);

        await userEvent.click(screen.getByTestId("TestButton"));

        expect(screen.queryByTestId("NftCollectionSlider__noresults")).not.toBeInTheDocument();

        expect(screen.getByText(collectionName)).toBeInTheDocument();

        expect(screen.getByText(secondCollectionName)).toBeInTheDocument();

        const searchInput = screen.getByTestId("NftCollectionSlider__search");

        server.resetHandlers();
        server.use(
            requestMock(`${baseUrl}/collections`, {
                nfts: [nfts[1]],
                collections: {
                    paginated: {
                        data: [],
                        ...SamplePageMeta.paginated,
                    },
                },
            }),
        );

        component.rerender(<Component collectionsOverride={[nfts[1]]} />);
        await userEvent.type(searchInput, "alpha");

        expect(screen.queryByText(collectionName)).not.toBeInTheDocument();
    });

    it("should clear the query with the clear button", async () => {
        render(<Component collectionsOverride={collectionsOverride} />);

        await userEvent.click(screen.getByTestId("TestButton"));

        expect(screen.queryByTestId("NftCollectionSlider__noresults")).not.toBeInTheDocument();

        expect(screen.getByText(collectionName)).toBeInTheDocument();

        expect(screen.getByText(secondCollectionName)).toBeInTheDocument();

        await userEvent.type(screen.getByTestId("NftCollectionSlider__search"), "alpha");

        expect(screen.getByTestId("NftCollectionSlider__clear-search")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("NftCollectionSlider__clear-search"));

        expect(screen.queryByTestId("NftCollectionSlider__clear-search")).not.toBeInTheDocument();
    });

    it("should toggle 'Load More Collections' button depending on the loaded collections", async () => {
        server.resetHandlers();

        server.use(
            requestMock(`${baseUrl}/collections`, {
                nfts,
                collections: {
                    paginated: {
                        data: [],
                        ...SampleLastPageMeta.paginated,
                    },
                },
            }),
        );

        const { rerender } = render(<Component />);

        await userEvent.click(screen.getByTestId("TestButton"));

        expect(screen.queryByTestId("NftCollectionSlider__loadMoreCollections")).not.toBeInTheDocument();

        server.use(
            requestMock(`${baseUrl}/collections`, {
                nfts,
                collections: {
                    paginated: {
                        data: [],
                        ...SamplePageMeta.paginated,
                    },
                },
            }),
        );

        rerender(
            <Component
                meta={{ next_page_url: "https:/test?page=2" }}
                collectionsOverride={collectionsOverride}
                collectionCount={15}
            />,
        );

        await userEvent.click(screen.getByTestId("TestButton"));

        expect(screen.getByTestId("NftCollectionSlider__loadMoreCollections")).toBeInTheDocument();
    });

    it("should show loading skeletons when `Load More Collections` clicked", async () => {
        const newNfts = new GalleryNftDataFactory().withImages().createMany(2, {
            collectionSlug: "severus-snape",
            collectionName: "Severus Snape",
        });

        server.resetHandlers();
        server.use(
            requestMock(
                `${baseUrl}/collections`,
                {
                    nfts: newNfts,
                    collections: {
                        paginated: {
                            data: [],
                            ...SamplePageMeta.paginated,
                        },
                    },
                },
                {
                    delay: 100,
                },
            ),
            requestMock(
                `${baseUrl}`,
                {
                    nfts: newNfts,
                    collections: {
                        paginated: {
                            data: [],
                            ...SamplePageMeta.paginated,
                        },
                    },
                },
                {
                    delay: 100,
                },
            ),
        );

        render(
            <Component
                collectionsOverride={[nfts[0]]}
                collectionCount={10}
            />,
        );

        await userEvent.click(screen.getByTestId("TestButton"));

        expect(screen.getByTestId("LoadingBlock")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("LoadingBlock")).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.queryByTestId("NftCollectionSlider__loadMoreCollections")).toBeInTheDocument();
        });

        await userEvent.click(screen.getByTestId("NftCollectionSlider__loadMoreCollections"));

        await waitFor(() => {
            expect(screen.queryAllByTestId("Collection_Skeleton")).toHaveLength(9);
        });

        await waitFor(() => {
            expect(screen.queryAllByTestId("Collection_Skeleton")).toHaveLength(0);
        });
    });

    it.each(["NftCollectionSlider__cancel", "NftCollectionSlider__add"])(
        "should clear the query when adding or cancelling",
        async (buttonTestId) => {
            render(<Component />);

            await userEvent.click(screen.getByTestId("TestButton"));

            expect(screen.queryByTestId("NftCollectionSlider__noresults")).not.toBeInTheDocument();
            expect(screen.getByText(collectionName)).toBeInTheDocument();

            // Open accordion to select nfts
            await userEvent.click(screen.getAllByTestId(accordionHeader)[0]);

            // Select nft to add
            expect(screen.getByTestId(firstNft)).toBeInTheDocument();
            await userEvent.click(screen.getByTestId(firstNft));

            await userEvent.click(screen.getByTestId(buttonTestId));

            expect(screen.queryByTestId(buttonTestId)).not.toBeInTheDocument();
        },
    );
});
