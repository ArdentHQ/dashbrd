import { type SpyInstance } from "vitest";
import { CollectionsGrid } from "./CollectionsGrid";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";
import FloorPriceDataFactory from "@/Tests/Factories/FloorPriceDataFactory";
import { mockViewportVisibilitySensor } from "@/Tests/Mocks/Handlers/viewport";
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
                alreadyReportedByCollection={{}}
                reportByCollectionAvailableIn={{}}
                onChanged={vi.fn()}
            />,
        );

        expect(getByTestId("CollectionsGridSkeleton")).toBeInTheDocument();
    });

    it("should display collections in the order they were provided", () => {
        mockViewportVisibilitySensor({
            inViewport: true,
        });

        const ethereumValues = [0.1, 0.2, 0.4, 0.7, 0.3, 0.1, 0.05, null, null];
        const usdcValues = [100, 200, 400, 700, 300, 100, 50, null, null];

        const ethValue = 1821.88;
        const collections = [
            ...ethereumValues.map((cryptoValue) =>
                new CollectionFactory().create({
                    floorPrice: new FloorPriceDataFactory().create({
                        value: cryptoValue !== null ? (cryptoValue * 1e18).toString() : cryptoValue,
                        fiat: cryptoValue !== null ? cryptoValue * ethValue : null,
                        currency: "ETH",
                        decimals: 18,
                    }),
                    nftsCount: 1,
                }),
            ),

            ...usdcValues.map((floorPriceFiat) =>
                new CollectionFactory().create({
                    floorPrice: new FloorPriceDataFactory().create({
                        value: floorPriceFiat !== null ? (floorPriceFiat * 1e6).toString() : floorPriceFiat,
                        fiat: floorPriceFiat,
                        currency: "USDC",
                        decimals: 6,
                    }),
                    nftsCount: 1,
                }),
            ),
        ];

        const defaultGrid = render(
            <CollectionsGrid
                hiddenCollectionAddresses={[]}
                collections={collections}
                alreadyReportedByCollection={{}}
                reportByCollectionAvailableIn={{}}
                onChanged={vi.fn()}
            />,
        );

        expect(defaultGrid.getByTestId("CollectionsGrid")).toBeInTheDocument();

        expect(defaultGrid.getAllByTestId("CollectionCard")).toHaveLength(collections.length);
        expect(defaultGrid.getAllByTestId("CollectionFloorPrice")).toHaveLength(collections.length - 4); // offset by 4 because of nulls...

        const values = defaultGrid.getAllByTestId("CollectionFloorPrice");

        const sorted: string[] = [
            "0.1 ETH",
            "0.2 ETH",
            "0.4 ETH",
            "0.7 ETH",
            "0.3 ETH",
            "0.1 ETH",
            "0.05 ETH",
            "100 USDC",
            "200 USDC",
            "400 USDC",
            "700 USDC",
            "300 USDC",
            "100 USDC",
            "50 USDC",
        ];

        for (let index = 0; index < sorted.length; index++) {
            expect(values[index]).toHaveTextContent(sorted[index]);
        }

        // Unmount previous grid
        defaultGrid.unmount();

        // Sort by value ascending, if null then first
        const collectionsSortedByFloorPrice = collections.sort((a, b) => {
            if (a.floorPrice.fiat === null) {
                return -1;
            }

            if (b.floorPrice.fiat === null) {
                return 1;
            }

            return a.floorPrice.fiat - b.floorPrice.fiat;
        });

        const sortedGrid = render(
            <CollectionsGrid
                hiddenCollectionAddresses={[]}
                collections={collectionsSortedByFloorPrice}
                alreadyReportedByCollection={{}}
                reportByCollectionAvailableIn={{}}
                onChanged={vi.fn()}
            />,
        );

        expect(sortedGrid.getAllByTestId("CollectionCard")).toHaveLength(collectionsSortedByFloorPrice.length);

        const sortedValues = sortedGrid.getAllByTestId("CollectionFloorPrice");

        const expectedSortedValues = [
            "50 USDC",
            "0.05 ETH",
            "100 USDC",
            "100 USDC",
            "0.1 ETH",
            "0.1 ETH",
            "200 USDC",
            "300 USDC",
            "0.2 ETH",
            "400 USDC",
            "0.3 ETH",
            "700 USDC",
            "0.4 ETH",
            "0.7 ETH",
        ];

        for (let index = 0; index < sorted.length; index++) {
            expect(sortedValues[index]).toHaveTextContent(expectedSortedValues[index]);
        }
    });
});
