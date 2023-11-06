import { groupBy } from "@ardenthq/sdk-helpers";
import React, { useEffect } from "react";
import { beforeEach, expect } from "vitest";
import GalleryNftData = App.Data.Gallery.GalleryNftData;
import { GalleryNfts, useGalleryNftsContext } from "@/Components/Galleries/Hooks/useGalleryNftsContext";
import * as useMetaMaskContext from "@/Contexts/MetaMaskContext";
import GalleryNftDataFactory from "@/Tests/Factories/Gallery/GalleryNftDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { BASE_URL, requestMock, requestMockOnce, server } from "@/Tests/Mocks/server";
import { SamplePageMeta } from "@/Tests/SampleData";
import { getSampleMetaMaskState } from "@/Tests/SampleData/SampleMetaMaskState";
import { mockAuthContext, render } from "@/Tests/testing-library";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import axios from "axios";

describe("useGalleryNftsContext", () => {
    const firstCollectionNfts = new GalleryNftDataFactory().withImages().createMany(3, {
        collectionSlug: "Dumbledore",
        collectionNftCount: 5,
    });

    const secondCollectionNfts = new GalleryNftDataFactory().withImages().createMany(3, {
        collectionSlug: "Voldemort",
        collectionNftCount: 3,
    });

    const nfts = [...firstCollectionNfts, ...secondCollectionNfts].flat();

    const HookTestComponent = (): JSX.Element => {
        const {
            nfts,
            remainingCollectionCount,
            allNftsLoaded,
            loadingCollections,
            loadMoreCollections,
            loadMoreNfts,
            loadingNfts,
            getLoadingNftsCount,
            searchNfts,
        } = useGalleryNftsContext();

        const collectionGroups = groupBy(nfts, (nft: App.Data.Gallery.GalleryNftData) => nft.collectionSlug) as Record<
            string,
            GalleryNftData[]
        >;

        useEffect(() => {
            void searchNfts();
        }, []);

        const collections = Object.entries(collectionGroups);

        return (
            <div>
                {collections.map(([key, nfts]) => (
                    <div key={key}>
                        <div className="TestGallery_Collection">
                            <span>{nfts[0].collectionName}</span>
                            <span>{nfts[0].collectionNftCount}</span>
                        </div>
                        <div className="nfts">
                            {nfts.map((nft) => (
                                <div
                                    key={nft.id}
                                    className="TestGallery_NFT"
                                    data-testid={`TestGallery_NFT--${nft.id}`}
                                >
                                    {nft.name}
                                </div>
                            ))}
                            {Array.from({ length: getLoadingNftsCount(nfts[0]) })
                                .fill(0)
                                .map((_, index) => (
                                    <div
                                        key={index}
                                        data-testid={`NFT_Skeleton--${nfts[0].collectionSlug}`}
                                    >
                                        ...
                                    </div>
                                ))}
                            {loadingNfts(nfts[0]) && <p data-testid="TestGallery_loadingNFTs">loading NFTs...</p>}
                            {!allNftsLoaded(nfts[0]) && (
                                <button
                                    data-testid={`loadNfts--${nfts[0].collectionSlug}`}
                                    onClick={() => {
                                        loadMoreNfts(nfts[0]);
                                    }}
                                >
                                    Load more NFTs
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {loadingCollections && <p data-testid="TestGallery_loadingCollections">loading collections...</p>}
                {remainingCollectionCount() > 0 && (
                    <button
                        onClick={() => {
                            loadMoreCollections();
                        }}
                        data-testid="TestGallery__loadCollections"
                    >
                        load {remainingCollectionCount()} more collections
                    </button>
                )}
            </div>
        );
    };

    const Component = ({
        nftsPerPage,
        collectionsPerPage,
    }: {
        nftsPerPage?: number;
        collectionsPerPage?: number;
    }): JSX.Element => (
        <GalleryNfts
            nftsPerPage={nftsPerPage ?? 10}
            collectionsPerPage={collectionsPerPage ?? 10}
        >
            <HookTestComponent />
        </GalleryNfts>
    );

    let resetAuthContext: () => void;

    beforeAll(() => {
        vi.spyOn(useMetaMaskContext, "useMetaMaskContext").mockReturnValue(getSampleMetaMaskState());

        resetAuthContext = mockAuthContext({
            user: new UserDataFactory().create(),
            wallet: new WalletFactory().create(),
        });
    });

    afterAll(() => {
        vi.restoreAllMocks();

        resetAuthContext();
    });

    beforeEach(() => {
        server.use(
            requestMock(`${BASE_URL}/my-galleries/collections`, {
                nfts,
                collections: {
                    paginated: {
                        data: [],
                        links: SamplePageMeta.paginated.links,
                        meta: {
                            ...SamplePageMeta.paginated.meta,
                            next_page_url: `${BASE_URL}/my-galleries/collections?page=2`,
                            first_page_url: `${BASE_URL}/my-galleries/collections`,
                            total: 3,
                        },
                    },
                },
            }),
        );
    });

    it("should throw exception if not inside context", () => {
        const originalError = console.error;
        console.error = vi.fn();

        const NoProviderComponent = (): JSX.Element => {
            useGalleryNftsContext();

            return <div></div>;
        };

        expect(() => render(<NoProviderComponent />)).toThrowError(
            "useGalleryNftsContext must be within GalleryNftsContext.Provider",
        );

        console.error = originalError;
    });

    it("should load collections when `Load More Collections` clicked", async () => {
        const { container } = render(
            <Component
                collectionsPerPage={10}
                nftsPerPage={10}
            />,
        );

        await waitFor(() => {
            expect(container.getElementsByClassName("TestGallery_Collection").length).toBe(2);
        });

        expect(container.getElementsByClassName("TestGallery_NFT").length).toBe(6);

        const newNfts1 = new GalleryNftDataFactory().withImages().createMany(2, {
            collectionSlug: "severus-snape",
            collectionName: "Severus Snape",
        });

        server.use(
            requestMockOnce(`${BASE_URL}/my-galleries/collections`, {
                nfts: newNfts1,
                collections: {
                    paginated: {
                        data: [],
                        links: SamplePageMeta.paginated.links,
                        meta: {
                            ...SamplePageMeta.paginated.meta,
                            total: 3,
                        },
                    },
                },
            }),
        );

        act(() => {
            fireEvent.click(screen.getByTestId("TestGallery__loadCollections"));
        });

        expect(screen.getByTestId("TestGallery_loadingCollections")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TestGallery_loadingCollections")).not.toBeInTheDocument();

            expect(container.getElementsByClassName("TestGallery_Collection").length).toBe(3);
            expect(container.getElementsByClassName("TestGallery_NFT").length).toBe(8);

            expect(screen.getByText("Severus Snape")).toBeInTheDocument();

            // Load More Collections shouldn't be there as all loaded
            expect(screen.queryByTestId("TestGallery__loadCollections")).not.toBeInTheDocument();
        });
    });

    it("should not make another fetch collections call when one in progress", async () => {
        render(<Component />);

        await waitFor(() => {
            expect(screen.getByTestId("TestGallery__loadCollections")).toBeInTheDocument();
        });

        server.use(
            requestMockOnce(`${BASE_URL}/my-galleries/collections`, {
                nfts,
                collections: {
                    paginated: {
                        data: [],
                        ...SamplePageMeta.paginated,
                    },
                },
            }),
        );

        const fetchCollectionsMock = vi.spyOn(axios, "get");

        fireEvent.click(screen.getByTestId("TestGallery__loadCollections"));
        fireEvent.click(screen.getByTestId("TestGallery__loadCollections"));

        expect(fetchCollectionsMock).toHaveBeenCalledTimes(1);
    });

    it("should not show a load more NFTs button if all loaded", async () => {
        render(<Component />);

        expect(await screen.findByTestId(`loadNfts--${firstCollectionNfts[0].collectionSlug}`)).toBeInTheDocument();
        expect(screen.queryByTestId(`loadNfts--${secondCollectionNfts[0].collectionSlug}`)).not.toBeInTheDocument();
    });

    it("should load NFTs when `Load More NFTs` clicked", async () => {
        const firstCollectionSlug = firstCollectionNfts[0].collectionSlug;

        const newNft = new GalleryNftDataFactory().withImages().create({
            name: "Weasley",
            collectionSlug: firstCollectionSlug,
            collectionName: firstCollectionSlug,
        });

        server.use(
            requestMockOnce(route("my-galleries.nfts", { slug: firstCollectionSlug }), {
                nfts: [newNft],
            }),
        );

        const { container } = render(<Component />);

        await waitFor(() => {
            expect(container.getElementsByClassName("TestGallery_Collection").length).toBe(2);
        });

        expect(container.getElementsByClassName("TestGallery_NFT").length).toBe(6);

        act(() => {
            fireEvent.click(screen.getByTestId(`loadNfts--${firstCollectionSlug}`));
        });

        expect(screen.getByTestId("TestGallery_loadingNFTs")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TestGallery_loadingNFTs")).not.toBeInTheDocument();

            expect(container.getElementsByClassName("TestGallery_Collection").length).toBe(2);
            expect(container.getElementsByClassName("TestGallery_NFT").length).toBe(7);

            expect(screen.getByTestId(`TestGallery_NFT--${newNft.id}`)).toBeInTheDocument();
        });

        const newNft2 = new GalleryNftDataFactory().withImages().create({
            name: "Hermione",
            collectionSlug: firstCollectionSlug,
            collectionName: firstCollectionSlug,
        });

        server.use(
            requestMockOnce(route("my-galleries.nfts", { slug: firstCollectionSlug }), {
                nfts: [newNft2],
            }),
        );

        act(() => {
            fireEvent.click(screen.getByTestId(`loadNfts--${firstCollectionSlug}`));
        });

        expect(screen.getByTestId("TestGallery_loadingNFTs")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId("TestGallery_loadingNFTs")).not.toBeInTheDocument();

            expect(container.getElementsByClassName("TestGallery_NFT").length).toBe(8);
            expect(screen.getByTestId(`TestGallery_NFT--${newNft2.id}`)).toBeInTheDocument();

            expect(screen.queryByTestId(`loadNfts--${firstCollectionSlug}`)).not.toBeInTheDocument();
        });
    });

    it("should not make another fetch NFTs call when one in progress", async () => {
        render(<Component />);

        const firstCollectionSlug = firstCollectionNfts[0].collectionSlug;

        server.use(
            requestMockOnce(route("my-galleries.nfts", { slug: firstCollectionSlug }), {
                nfts: [],
            }),
        );

        const fetchCollectionsMock = vi.spyOn(axios, "get");

        await waitFor(() => {
            expect(screen.getByTestId(`loadNfts--${firstCollectionSlug}`)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId(`loadNfts--${firstCollectionSlug}`));
        fireEvent.click(screen.getByTestId(`loadNfts--${firstCollectionSlug}`));

        expect(fetchCollectionsMock).toHaveBeenCalledTimes(1);
    });

    it("should show skeleton elements for the loading NFTs", async () => {
        const firstCollectionSlug = firstCollectionNfts[0].collectionSlug;

        const newNft = new GalleryNftDataFactory().withImages().create({
            name: "Weasley",
            collectionSlug: firstCollectionSlug,
            collectionName: firstCollectionSlug,
        });

        server.use(
            requestMockOnce(route("my-galleries.nfts", { slug: firstCollectionSlug }), {
                nfts: [newNft],
            }),
        );

        const { rerender } = render(<Component nftsPerPage={3} />);

        await waitFor(() => {
            expect(screen.getByTestId(`loadNfts--${firstCollectionSlug}`)).toBeInTheDocument();
        });

        act(() => {
            fireEvent.click(screen.getByTestId(`loadNfts--${firstCollectionSlug}`));
        });

        expect(screen.getByTestId("TestGallery_loadingNFTs")).toBeInTheDocument();
        expect(screen.getAllByTestId(`NFT_Skeleton--${firstCollectionSlug}`).length).toBe(2);

        await waitFor(() => {
            expect(screen.queryByTestId("TestGallery_loadingNFTs")).not.toBeInTheDocument();
            expect(screen.queryAllByTestId(`NFT_Skeleton--${firstCollectionSlug}`).length).toBe(0);
        });

        const nfts = new GalleryNftDataFactory().withImages().createMany(2, {
            collectionNftCount: 6,
            collectionSlug: "mudblood",
        });

        const newNftSlug = nfts[0].collectionSlug;

        server.use(
            requestMock(`${BASE_URL}/my-galleries/collections`, {
                nfts,
                collections: {
                    paginated: {
                        data: [],
                        links: SamplePageMeta.paginated.links,
                        meta: {
                            ...SamplePageMeta.paginated.meta,
                            next_page_url: `${BASE_URL}/my-galleries/collections?page=2`,
                            first_page_url: `${BASE_URL}/my-galleries/collections`,
                            total: 3,
                        },
                    },
                },
            }),
            requestMockOnce(route("my-galleries.nfts", { slug: newNftSlug }), {
                nfts: [],
            }),
        );

        rerender(<Component nftsPerPage={2} />);

        await waitFor(() => {
            expect(screen.getByTestId(`loadNfts--${newNftSlug}`)).toBeInTheDocument();
        });

        // should render nftsPerPage amount of skeletons as unfetched 4 > 2

        act(() => {
            fireEvent.click(screen.getByTestId(`loadNfts--${newNftSlug}`));
        });

        expect(screen.getAllByTestId(`NFT_Skeleton--${newNftSlug}`).length).toBe(2);

        await waitFor(() => {
            expect(screen.queryAllByTestId(`NFT_Skeleton--${newNftSlug}`).length).toBe(0);
        });
    });
});
