import { type SpyInstance } from "vitest";
import { mockViewportVisibilitySensor } from "vitest.setup";
import { CollectionsGrid } from "./CollectionsGrid";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";
import { render } from "@/Tests/testing-library";

let useAuthorizedActionSpy: SpyInstance;
const signedActionMock = vi.fn();

describe("CollectionsGrid", () => {
    beforeEach(() => {
        signedActionMock.mockImplementation((action) => {
            action({ authenticated: true, signed: true });
        });

        useAuthorizedActionSpy = vi.spyOn(useAuthorizedActionMock, "useAuthorizedAction").mockReturnValue({
            signedAction: signedActionMock,
            authenticatedAction: vi.fn(),
        });
    });

    afterEach(() => {
        useAuthorizedActionSpy.mockRestore();
    });

    it("should render loading state", () => {
        const { getByTestId } = render(
            <CollectionsGrid
                isLoading
                hiddenCollectionAddresses={[]}
                collections={[]}
                nfts={[]}
                alreadyReportedByCollection={{}}
                reportByCollectionAvailableIn={{}}
                onChanged={vi.fn()}
            />,
        );

        expect(getByTestId("CollectionsGridSkeleton")).toBeInTheDocument();
    });

    it("sorts using value descending by default", () => {
        mockViewportVisibilitySensor({
            inViewport: true,
        });

        const ethereumValues = [0.1, 0.2, 0.4, 0.7, 0.3, 0.1, 0.05, null, null];
        const usdcValues = [100, 200, 400, 700, 300, 100, 50, null, null];

        const ethValue = 1821.88;
        const collections = [
            ...ethereumValues.map((cryptoValue) =>
                new CollectionFactory().create({
                    floorPrice: cryptoValue !== null ? (cryptoValue * 1e18).toString() : cryptoValue,
                    floorPriceFiat: cryptoValue !== null ? cryptoValue * ethValue : null,
                    floorPriceCurrency: "ETH",
                    floorPriceDecimals: 18,
                    nftsCount: 1,
                }),
            ),

            ...usdcValues.map((floorPriceFiat) =>
                new CollectionFactory().create({
                    floorPrice: floorPriceFiat !== null ? (floorPriceFiat * 1e6).toString() : floorPriceFiat,
                    floorPriceFiat,
                    floorPriceCurrency: "USDC",
                    floorPriceDecimals: 6,
                    nftsCount: 1,
                }),
            ),
        ];

        const { getByTestId, getAllByTestId } = render(
            <CollectionsGrid
                hiddenCollectionAddresses={[]}
                collections={collections}
                nfts={[]}
                alreadyReportedByCollection={{}}
                reportByCollectionAvailableIn={{}}
                onChanged={vi.fn()}
            />,
        );

        expect(getByTestId("CollectionsGrid")).toBeInTheDocument();

        expect(getAllByTestId("CollectionCard")).toHaveLength(collections.length);
        expect(getAllByTestId("CollectionFloorPrice")).toHaveLength(collections.length - 4); // offset by 4 because of nulls...

        const values = getAllByTestId("CollectionFloorPrice");

        const sorted: string[] = [
            "0.7 ETH",
            "0.4 ETH",
            "700 USDC",
            "0.3 ETH",
            "400 USDC",
            "0.2 ETH",
            "300 USDC",
            "200 USDC",
            "1 ETH",
            "1 ETH",
            "100 USDC",
            "100 USDC",
            "0.05 ETH",
            "50 USDC",
        ];

        for (let index = 0; index < sorted.length; index++) {
            expect(values[index]).toHaveTextContent(sorted[index]);
        }
    });
});
