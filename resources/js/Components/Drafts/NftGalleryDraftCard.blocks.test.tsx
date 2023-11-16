import userEvent from "@testing-library/user-event";
import { type SpyInstance } from "vitest";
import {
    NftGalleryDraftFooter,
    NftGalleryDraftHeading,
    NftGalleryDraftImageContainer,
    NftGalleryDraftImageGrid,
    NftGalleryDraftStats,
} from "./NftGalleryDraftCard.blocks";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import { type DraftNft, type GallerySavedDraft } from "@/Pages/Galleries/hooks/useWalletDraftGalleries";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { mockAuthContext, render, screen } from "@/Tests/testing-library";

describe("NftGalleryDraftFooter", () => {
    it("should render", () => {
        render(<NftGalleryDraftFooter onDelete={vi.fn()} />);

        expect(screen.getByTestId("NftGalleryDraftCard__Footer")).toBeInTheDocument();
    });

    it("should handle on delete", async () => {
        const onDelete = vi.fn();

        render(<NftGalleryDraftFooter onDelete={onDelete} />);

        await userEvent.click(screen.getByTestId("DeleteGalleryButton"));

        expect(onDelete).toHaveBeenCalled();
    });
});

describe("NftGalleryDraftHeading", () => {
    it("should render", () => {
        render(
            <NftGalleryDraftHeading
                walletAddress="0x22Fd644149ea87ca26237183ad6A66f91dfcFB87"
                title="Test title"
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftHeading")).toBeInTheDocument();
        expect(screen.queryByTestId("Avatar__image")).not.toBeInTheDocument();
    });

    it("should truncate the wallet address", () => {
        render(
            <NftGalleryDraftHeading
                walletAddress="0x22Fd644149ea87ca26237183ad6A66f91dfcFB87"
                title="Test title"
            />,
        );

        expect(screen.getByTestId("GalleryHeading__address")).toHaveTextContent("0x22F…cFB87");
    });
});

describe("NftGalleryDraftStats", () => {
    const draft: GallerySavedDraft = {
        id: 1,
        title: "Test draft",
        cover: null,
        coverType: null,
        coverFileName: null,
        walletAddress: "0x22Fd644149ea87ca26237183ad6A66f91dfcFB87",
        nfts: [],
        value: "400",
        collectionsCount: 1,
        updatedAt: 123,
    };

    const user = new UserDataFactory().create();
    user.attributes.currency = "EUR";

    let resetAuthContextMock: () => void;

    let useAuthorizedActionSpy: SpyInstance;
    const signedActionMock = vi.fn();

    beforeEach(() => {
        resetAuthContextMock = mockAuthContext({
            user,
        });

        signedActionMock.mockImplementation((action) => {
            action({ authenticated: true, signed: true });
        });

        useAuthorizedActionSpy = vi.spyOn(useAuthorizedActionMock, "useAuthorizedAction").mockReturnValue({
            signedAction: signedActionMock,
            authenticatedAction: vi.fn(),
        });
    });

    afterEach(() => {
        resetAuthContextMock();

        useAuthorizedActionSpy.mockRestore();
    });

    it("should render", () => {
        render(
            <NftGalleryDraftStats
                draft={draft}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftStats")).toBeInTheDocument();
    });

    it("should handle on delete", async () => {
        const onDelete = vi.fn();

        render(
            <NftGalleryDraftStats
                draft={draft}
                onDelete={onDelete}
            />,
        );

        await userEvent.click(screen.getByTestId("DeleteGalleryButton"));

        expect(onDelete).toHaveBeenCalled();
    });

    it("should render the draft value", () => {
        render(
            <NftGalleryDraftStats
                draft={draft}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftStats__value")).toHaveTextContent("400");
    });

    it("should render the draft collections count", () => {
        render(
            <NftGalleryDraftStats
                draft={draft}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftStats__collectionsCount")).toHaveTextContent("0");
    });

    it("should render the nft count", () => {
        render(
            <NftGalleryDraftStats
                draft={draft}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftStats__nftCount")).toHaveTextContent("0");
    });

    it("shoud display N/A if value is not set", () => {
        render(
            <NftGalleryDraftStats
                draft={{ ...draft, value: null }}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftStats__value")).toHaveTextContent("N/A");
    });

    it("should display the currency set by the user", () => {
        render(
            <NftGalleryDraftStats
                draft={draft}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftStats__value")).toHaveTextContent("€400.00");
    });

    it("should display USD as currency if no currency is set", () => {
        resetAuthContextMock = mockAuthContext({
            user: null,
        });
        render(
            <NftGalleryDraftStats
                draft={draft}
                onDelete={vi.fn()}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftStats__value")).toHaveTextContent("$400.00");
    });
});

describe("NftGalleryDraftImageContainer", () => {
    const nft: DraftNft = {
        nftId: 1,
        image: "https://example.com/image.png",
        collectionSlug: "test-collection",
    };

    it("should render", () => {
        render(<NftGalleryDraftImageContainer nft={nft} />);

        expect(screen.getByTestId("NftGalleryDraftImageGrid__container--1")).toBeInTheDocument();
    });

    it("should render the image", () => {
        render(<NftGalleryDraftImageContainer nft={nft} />);

        expect(screen.getByTestId("NftGalleryDraftImageGrid__image--1")).toBeInTheDocument();
    });
});

describe("NftGalleryDraftImageGrid", () => {
    const nfts = [
        {
            nftId: 1,
            image: "https://example.com/image.png",
            collectionSlug: "test-collection",
        },
        {
            nftId: 2,
            image: "https://example.com/image.png",
            collectionSlug: "test-collection",
        },
    ];

    it("should render", () => {
        render(<NftGalleryDraftImageGrid nfts={nfts} />);

        expect(screen.getByTestId("NftGalleryDraftImageGrid")).toBeInTheDocument();
    });

    it("should render placeholders if there are no nfts", () => {
        render(<NftGalleryDraftImageGrid nfts={[]} />);

        expect(screen.getByTestId("NftGalleryDraftImageGrid__placeholder--1")).toBeInTheDocument();
    });

    it("should render nfts if there are nfts", () => {
        render(<NftGalleryDraftImageGrid nfts={nfts} />);

        expect(screen.getByTestId("NftGalleryDraftImageGrid__container--1")).toBeInTheDocument();
        expect(screen.getByTestId("NftGalleryDraftImageGrid__container--2")).toBeInTheDocument();
    });

    it("should ony display the minimum number of nfts", () => {
        render(
            <NftGalleryDraftImageGrid
                nfts={nfts}
                minimumToShow={1}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftImageGrid__container--1")).toBeInTheDocument();
        expect(screen.queryByTestId("NftGalleryDraftImageGrid__container--2")).not.toBeInTheDocument();
    });

    it("should render the difference between the amount of nfts and the minimum to show as placeholders", () => {
        render(
            <NftGalleryDraftImageGrid
                nfts={nfts}
                minimumToShow={3}
            />,
        );

        expect(screen.getByTestId("NftGalleryDraftImageGrid__placeholder--0")).toBeInTheDocument();
    });

    it("should render skeleton elements if skeletonCount is provided", () => {
        render(
            <NftGalleryDraftImageGrid
                nfts={[]}
                skeletonCount={3}
            />,
        );

        expect(screen.getAllByTestId("Skeleton").length).toBe(3);
    });
});
