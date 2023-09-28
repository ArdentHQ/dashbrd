import React from "react";
import { type SpyInstance } from "vitest";
import {
    GalleryHeading,
    GalleryHeadingPlaceholder,
    GalleryStats,
    GalleryStatsPlaceholder,
    NftImageGrid,
} from "./NftGalleryCard.blocks";
import * as useAuth from "@/Hooks/useAuth";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import * as useLikes from "@/Hooks/useLikes";
import GalleryDataFactory from "@/Tests/Factories/Gallery/GalleryDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";
const collectionInfo: Pick<
    App.Data.Gallery.GalleryNftData,
    | "chainId"
    | "tokenAddress"
    | "collectionImage"
    | "collectionName"
    | "collectionNftCount"
    | "collectionSlug"
    | "collectionWebsite"
    | "floorPrice"
    | "floorPriceCurrency"
    | "floorPriceDecimals"
    | "lastActivityFetchedAt"
    | "lastViewedAt"
> = {
    chainId: 1,
    tokenAddress: "0xCollectionAddress",
    collectionImage: "collection-image",
    collectionName: "Test Collection",
    collectionNftCount: 1,
    collectionSlug: "test-collection",
    collectionWebsite: "https://example.com",
    floorPrice: "0.1",
    floorPriceCurrency: "eth",
    floorPriceDecimals: 18,
    lastActivityFetchedAt: new Date().toString(),
    lastViewedAt: new Date().toString(),
};

const paginationData = {
    links: [
        {
            url: "http://test.test",
            label: "test",
            active: true,
        },
    ],
    meta: {
        current_page: 1,
        first_page_url: "http://test.test",
        from: 1,
        last_page: 1,
        last_page_url: "http://test.test",
        next_page_url: null,
        path: "test",
        per_page: 10,
        prev_page_url: null,
        to: 1,
        total: 10,
    },
};

describe("NftImageGrid", () => {
    const nfts: App.Data.Gallery.GalleryNftData[] = [
        {
            id: 1,
            name: "nft_1",
            images: { thumb: "nft_image_1", small: "", large: "" },
            tokenNumber: "1",
            ...collectionInfo,
        },
        {
            id: 2,
            name: "nft_2",
            images: { thumb: "nft_image_2", small: "nft_image_2", large: "nft_image_2" },
            tokenNumber: "2",
            ...collectionInfo,
        },
        {
            id: 3,
            name: "nft_3",
            images: { thumb: "nft_image_3", small: "nft_image_3", large: "nft_image_3" },
            tokenNumber: "3",
            ...collectionInfo,
        },
        {
            id: 4,
            name: "nft_4",
            images: { thumb: null, small: null, large: null },
            tokenNumber: "4",
            ...collectionInfo,
        },
    ];

    it("shows a grid with placeholders if no NFT is present", () => {
        render(
            <NftImageGrid
                nfts={{
                    paginated: {
                        data: [],
                        ...paginationData,
                    },
                }}
            />,
        );

        expect(screen.getByTestId("NftImageGrid")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--0")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--1")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--2")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--3")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--4")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--5")).toBeInTheDocument();
    });

    it("should render with selected & added nfts", () => {
        render(
            <NftImageGrid
                nfts={{
                    paginated: {
                        data: nfts,
                        ...paginationData,
                    },
                }}
                selectedNfts={[nfts[0]]}
                addedNfts={[nfts[1]]}
            />,
        );

        expect(screen.getByTestId("NftImageGrid")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--1")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--2")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--3")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--4")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--0")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--1")).toBeInTheDocument();
        expect(screen.getByTestId(`NftImageGrid__container--2--disabled`)).toBeInTheDocument();
    });

    it("shows part placeholder, part nft when 4 NFTs are present", () => {
        render(
            <NftImageGrid
                nfts={{
                    paginated: {
                        data: nfts,
                        ...paginationData,
                    },
                }}
            />,
        );

        expect(screen.getByTestId("NftImageGrid")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--1")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--2")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--3")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--4")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--0")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__placeholder--1")).toBeInTheDocument();
    });

    it("shows no placeholders when all entries are filled with NFTs", () => {
        render(
            <NftImageGrid
                skeletonCount={1}
                nfts={{
                    paginated: {
                        data: [
                            ...nfts,
                            {
                                id: 5,
                                name: "nft_5",
                                images: { thumb: "nft_image_5", small: "nft_image_5", large: "nft_image_5" },
                                tokenNumber: "5",
                                ...collectionInfo,
                            },
                            {
                                id: 6,
                                name: "nft_6",
                                images: { thumb: "nft_image_6", small: "nft_image_6", large: "nft_image_6" },
                                tokenNumber: "6",
                                ...collectionInfo,
                            },
                        ],
                        ...paginationData,
                    },
                }}
            />,
        );

        expect(screen.getByTestId("NftImageGrid")).toBeInTheDocument();
        expect(screen.queryByTestId("NftImageGrid__placeholder--0")).not.toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--1")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--2")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--3")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--4")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--5")).toBeInTheDocument();
        expect(screen.getByTestId("NftImageGrid__image--6")).toBeInTheDocument();
    });

    it("should do nothing on click if not editable", async () => {
        render(
            <NftImageGrid
                nfts={{
                    paginated: {
                        data: [
                            ...nfts,
                            {
                                id: 5,
                                name: "nft_5",
                                images: { thumb: "nft_image_5", small: "nft_image_5", large: "nft_image_5" },
                                tokenNumber: "5",
                                ...collectionInfo,
                            },
                            {
                                id: 6,
                                name: "nft_6",
                                images: { thumb: "nft_image_6", small: "nft_image_6", large: "nft_image_6" },
                                tokenNumber: "6",
                                ...collectionInfo,
                            },
                        ],
                        ...paginationData,
                    },
                }}
            />,
        );

        await userEvent.click(screen.getByTestId("NftImageGrid__container--4"));

        expect(screen.queryByTestId("NftImageGrid__container--4--selected")).not.toBeInTheDocument();

        await userEvent.click(screen.getByTestId("NftImageGrid__container--4"));

        expect(screen.queryByTestId("NftImageGrid__container--4--selected")).not.toBeInTheDocument();
    });

    it("should show a skeleton elements if `skeletonCount` is set", () => {
        const { rerender, container } = render(
            <NftImageGrid
                nfts={{
                    paginated: {
                        data: [],
                        ...paginationData,
                    },
                }}
                skeletonCount={2}
            />,
        );

        expect(container.getElementsByClassName("NFT_Skeleton").length).toBe(2);

        rerender(
            <NftImageGrid
                nfts={{
                    paginated: {
                        data: [],
                        ...paginationData,
                    },
                }}
            />,
        );
        expect(container.getElementsByClassName("NFT_Skeleton").length).toBe(0);
    });
});

describe("GalleryHeading", () => {
    const wallet = new WalletFactory().withoutAvatar().withoutDomain().create({
        address: "0x1234567890123456789012345678901234567890",
    });

    const walletEns = new WalletFactory().withAvatar().withDomain().create({
        address: "0x1234567890123456789012345678901234567890",
        domain: "domain.eth",
    });

    it("should display the gallery name and user without ens", () => {
        render(
            <GalleryHeading
                name="My Gallery"
                wallet={wallet}
            />,
        );

        expect(screen.getByTestId("GalleryHeading__address")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryHeading__address")).toHaveTextContent("0x123…67890");
        expect(screen.queryByTestId("Avatar__image")).not.toBeInTheDocument();
    });

    it("should display the gallery name and user with ens", () => {
        render(
            <GalleryHeading
                name="My Gallery"
                wallet={walletEns}
            />,
        );

        expect(screen.getByTestId("GalleryHeading__address")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryHeading__address")).not.toHaveTextContent("0x123…67890");
        expect(screen.getByTestId("GalleryHeading__address")).toHaveTextContent("domain.eth");
        expect(screen.queryByTestId("Avatar__image")).toBeInTheDocument();
    });
});

describe("GalleryStats", () => {
    const gallery = new GalleryDataFactory().create({
        likes: 12,
        views: 45,
        hasLiked: false,
    });

    const user = new UserDataFactory().withUSDCurrency().create();

    let useAuthSpy: SpyInstance;

    const useAuthState = {
        user,
        wallet: null,
        authenticated: true,
        signed: false,
        showAuthOverlay: false,
        showCloseButton: false,
        closeOverlay: vi.fn(),
    };

    let useAuthorizedActionSpy: SpyInstance;
    const signedActionMock = vi.fn();

    beforeEach(() => {
        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue(useAuthState);

        signedActionMock.mockImplementation((action) => {
            action({ authenticated: true, signed: true });
        });

        useAuthorizedActionSpy = vi.spyOn(useAuthorizedActionMock, "useAuthorizedAction").mockReturnValue({
            signedAction: signedActionMock,
            authenticatedAction: vi.fn(),
        });
    });

    afterEach(() => {
        useAuthSpy.mockRestore();

        useAuthorizedActionSpy.mockRestore();
    });

    it("should display gallery stats", () => {
        const { container } = render(<GalleryStats gallery={gallery} />);

        expect(screen.getByTestId("GalleryStats")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryStats__likes")).toHaveTextContent("12");
        expect(screen.getByTestId("GalleryStats__views")).toHaveTextContent("45");

        expect(container.getElementsByClassName("fill-theme-danger-100 text-theme-danger-400").length).toBe(0);
    });

    it("should display gallery stats if no authenticated", () => {
        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user: null,
            wallet: null,
            authenticated: false,
            signed: false,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });

        const { container } = render(
            <GalleryStats
                gallery={{
                    ...gallery,
                    value: 1234.56,
                }}
            />,
        );

        expect(screen.getByTestId("GalleryStats")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryStats__likes")).toHaveTextContent("12");
        expect(screen.getByTestId("GalleryStats__views")).toHaveTextContent("45");

        expect(container.getElementsByClassName("fill-theme-danger-100 text-theme-danger-400").length).toBe(0);
    });

    it("should display value", () => {
        render(
            <GalleryStats
                gallery={{
                    ...gallery,
                    value: 1234.56,
                }}
            />,
        );

        expect(screen.getByTestId("GalleryStats")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryStats__value")).toHaveTextContent("$1,234.56");
    });

    it("should short format value if value is more than 1M", () => {
        render(
            <GalleryStats
                gallery={{
                    ...gallery,
                    value: 1234567.89,
                }}
            />,
        );

        expect(screen.getByTestId("GalleryStats")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryStats__value")).toHaveTextContent("$1.23M");
    });

    it("should display total value in tooltip if value is more than 1M", async () => {
        render(
            <GalleryStats
                gallery={{
                    ...gallery,
                    value: 12345678.9,
                }}
            />,
        );

        await userEvent.hover(screen.getByTestId("Tooltip__DynamicBalance__Short"));

        expect(screen.getByText("$12,345,678.90")).toBeInTheDocument();
    });

    it("should display '-' for null value", () => {
        render(
            <GalleryStats
                gallery={{
                    ...gallery,
                    value: null,
                }}
            />,
        );

        expect(screen.getByTestId("GalleryStats")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryStats__value")).toHaveTextContent("-");
    });

    it("should display gallery stats when user has liked the gallery", () => {
        const { container } = render(<GalleryStats gallery={{ ...gallery, hasLiked: true }} />);

        expect(screen.getByTestId("GalleryStats")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryStats__likes")).toHaveTextContent("12");
        expect(screen.getByTestId("GalleryStats__views")).toHaveTextContent("45");
        expect(container.getElementsByClassName("fill-theme-danger-100 text-theme-danger-400").length).toBe(1);
    });

    it("should handle click to the like button", async () => {
        const likeMock = vi.fn();

        vi.spyOn(useLikes, "useLikes").mockReturnValue({
            likes: 10,
            hasLiked: false,
            like: likeMock,
        });

        render(<GalleryStats gallery={{ ...gallery, hasLiked: false }} />);

        expect(screen.getByTestId("GalleryStats")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryStats__likes")).toHaveTextContent("10");

        await userEvent.click(screen.getByTestId("GalleryStats__like-button"));

        expect(likeMock).toHaveBeenCalled();
    });

    it("should display gallery stats placeholder", () => {
        render(<GalleryStatsPlaceholder />);

        expect(screen.getByTestId("GalleryStatsPlaceholder")).toBeInTheDocument();
    });

    it("should display gallery stats placeholder", () => {
        render(<GalleryHeadingPlaceholder />);

        expect(screen.getByTestId("GalleryHeadingPlaceholder")).toBeInTheDocument();
    });

    it("should force like if user was not authenticated", async () => {
        signedActionMock.mockImplementation((action) => {
            action({ authenticated: false, signed: false });
        });

        const likeMock = vi.fn();

        const likeSpy = vi.spyOn(useLikes, "useLikes").mockReturnValue({
            likes: 10,
            hasLiked: true,
            like: likeMock,
        });

        render(<GalleryStats gallery={{ ...gallery, hasLiked: false }} />);

        expect(screen.getByTestId("GalleryStats")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryStats__likes")).toHaveTextContent("10");

        await userEvent.click(screen.getByTestId("GalleryStats__like-button"));

        expect(likeMock).toHaveBeenCalledWith(gallery.slug, true);

        likeSpy.mockRestore();
    });

    it("should toggle like if user was authenticated", async () => {
        signedActionMock.mockImplementation((action) => {
            action({ authenticated: true, signed: false });
        });

        const likeMock = vi.fn();

        vi.spyOn(useLikes, "useLikes").mockReturnValue({
            likes: 10,
            hasLiked: true,
            like: likeMock,
        });

        render(<GalleryStats gallery={{ ...gallery, hasLiked: false }} />);

        expect(screen.getByTestId("GalleryStats")).toBeInTheDocument();

        expect(screen.getByTestId("GalleryStats__likes")).toHaveTextContent("10");

        await userEvent.click(screen.getByTestId("GalleryStats__like-button"));

        expect(likeMock).toHaveBeenCalledWith(gallery.slug, undefined);
    });
});
