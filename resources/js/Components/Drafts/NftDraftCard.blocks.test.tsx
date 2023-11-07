import { type SpyInstance } from "vitest";
import {
    NftDraftFooter,
    NftDraftHeading,
    NftDraftImageContainer,
    NftDraftImageGrid,
    NftDraftStats,
} from "./NftDraftCard.blocks";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import { type DraftNft, type GalleryDraft } from "@/Pages/Galleries/hooks/useGalleryDrafts";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { mockAuthContext, render, screen } from "@/Tests/testing-library";

describe("NftDraftFooter", () => {
    it("should render", () => {
        render(<NftDraftFooter />);

        expect(screen.getByTestId("NftDraftCard__Footer")).toBeInTheDocument();
    });
});

describe("NftDraftHeading", () => {
    it("should render", () => {
        render(
            <NftDraftHeading
                walletAddress="0x22Fd644149ea87ca26237183ad6A66f91dfcFB87"
                title="Test title"
            />,
        );

        expect(screen.getByTestId("NftDraftHeading")).toBeInTheDocument();
        expect(screen.queryByTestId("Avatar__image")).not.toBeInTheDocument();
    });

    it("should truncate the wallet address", () => {
        render(
            <NftDraftHeading
                walletAddress="0x22Fd644149ea87ca26237183ad6A66f91dfcFB87"
                title="Test title"
            />,
        );

        expect(screen.getByTestId("GalleryHeading__address")).toHaveTextContent("0x22F…cFB87");
    });
});

describe("NftDraftStats", () => {
    const draft: GalleryDraft = {
        id: 1,
        title: "Test draft",
        cover: null,
        coverType: null,
        walletAddress: "0x22Fd644149ea87ca26237183ad6A66f91dfcFB87",
        nfts: [],
        value: "400",
        collectionsCount: 0,
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
        render(<NftDraftStats draft={draft} />);

        expect(screen.getByTestId("NftDraftStats")).toBeInTheDocument();
    });

    it("should render the draft value", () => {
        render(<NftDraftStats draft={draft} />);

        expect(screen.getByTestId("NftDraftStats__value")).toHaveTextContent("400");
    });

    it("should render the draft collections count", () => {
        render(<NftDraftStats draft={draft} />);

        expect(screen.getByTestId("NftDraftStats__collectionsCount")).toHaveTextContent("0");
    });

    it("should render the nft count", () => {
        render(<NftDraftStats draft={draft} />);

        expect(screen.getByTestId("NftDraftStats__nftCount")).toHaveTextContent("0");
    });

    it("shoud display - if value is not set", () => {
        render(<NftDraftStats draft={{ ...draft, value: null }} />);

        expect(screen.getByTestId("NftDraftStats__value")).toHaveTextContent("-");
    });

    it("should display the currency set by the user", () => {
        render(<NftDraftStats draft={draft} />);

        expect(screen.getByTestId("NftDraftStats__value")).toHaveTextContent("€400.00");
    });

    it("should display USD as currency if no currency is set", () => {
        resetAuthContextMock = mockAuthContext({
            user: null,
        });
        render(<NftDraftStats draft={draft} />);

        expect(screen.getByTestId("NftDraftStats__value")).toHaveTextContent("$400.00");
    });
});

describe("NftDraftImageContainer", () => {
    const nft: DraftNft = {
        nftId: 1,
        image: "https://example.com/image.png",
        collectionSlug: "test-collection",
    };

    it("should render", () => {
        render(<NftDraftImageContainer nft={nft} />);

        expect(screen.getByTestId("NftDraftImageGrid__container--1")).toBeInTheDocument();
    });

    it("should render the image", () => {
        render(<NftDraftImageContainer nft={nft} />);

        expect(screen.getByTestId("NftDraftImageGrid__image--1")).toBeInTheDocument();
    });
});

describe("NftDraftImageGrid", () => {
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
        render(<NftDraftImageGrid nfts={nfts} />);

        expect(screen.getByTestId("NftDraftImageGrid")).toBeInTheDocument();
    });

    it("should render placeholders if there are no nfts", () => {
        render(<NftDraftImageGrid nfts={[]} />);

        expect(screen.getByTestId("NftDraftImageGrid__placeholder--1")).toBeInTheDocument();
    });

    it("should render nfts if there are nfts", () => {
        render(<NftDraftImageGrid nfts={nfts} />);

        expect(screen.getByTestId("NftDraftImageGrid__container--1")).toBeInTheDocument();
        expect(screen.getByTestId("NftDraftImageGrid__container--2")).toBeInTheDocument();
    });

    it("should ony display the minimum number of nfts", () => {
        render(
            <NftDraftImageGrid
                nfts={nfts}
                minimumToShow={1}
            />,
        );

        expect(screen.getByTestId("NftDraftImageGrid__container--1")).toBeInTheDocument();
        expect(screen.queryByTestId("NftDraftImageGrid__container--2")).not.toBeInTheDocument();
    });

    it("should render the difference between the amount of nfts and the minimum to show as placeholders", () => {
        render(
            <NftDraftImageGrid
                nfts={nfts}
                minimumToShow={3}
            />,
        );

        expect(screen.getByTestId("NftDraftImageGrid__placeholder--0")).toBeInTheDocument();
    });

    it("should render skeleton elements if skeletonCount is provided", () => {
        render(
            <NftDraftImageGrid
                nfts={[]}
                skeletonCount={3}
            />,
        );

        expect(screen.getAllByTestId("Skeleton").length).toBe(3);
    });
});
