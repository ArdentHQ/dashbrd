import { router } from "@inertiajs/react";
import { type SpyInstance } from "vitest";
import { PopularCollectionsTable } from "./PopularCollectionsTable";
import { PopularCollectionVolume } from "./PopularCollectionsTable.blocks";
import { PopularCollectionsTableItemSkeleton } from "./PopularCollectionsTableItem";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import { PeriodFilterOptions } from "@/Pages/Collections/Components/CollectionsFilterTabs";
import PopularCollectionFactory from "@/Tests/Factories/Collections/PopularCollectionFactory";
import FloorPriceDataFactory from "@/Tests/Factories/FloorPriceDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { render, userEvent } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

let useAuthorizedActionSpy: SpyInstance;
const signedActionMock = vi.fn();

describe("PopularCollectionsTable", () => {
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

    const collections = [
        ...new PopularCollectionFactory().createMany(2, {
            floorPrice: new FloorPriceDataFactory().create({
                change: 50,
            }),
        }),
        ...new PopularCollectionFactory().createMany(2, {
            floorPrice: new FloorPriceDataFactory().create({
                change: null,
            }),
        }),
    ];

    const user = new UserDataFactory().create();

    it.each(allBreakpoints)("renders without crashing on %s screen", (breakpoint) => {
        const { getByTestId } = render(
            <PopularCollectionsTable
                collections={collections}
                user={user}
            />,
            { breakpoint },
        );

        expect(getByTestId("PopularCollectionsTable")).toBeInTheDocument();
    });

    it("renders nothing if no collections", () => {
        const { queryByTestId } = render(
            <PopularCollectionsTable
                collections={[]}
                user={user}
            />,
        );

        expect(queryByTestId("PopularCollectionsTable")).not.toBeInTheDocument();
    });

    it("renders with floor price and volume", () => {
        const collections = [new PopularCollectionFactory().withPrices().withVolume().create()];

        const { getByTestId } = render(
            <PopularCollectionsTable
                collections={collections}
                user={user}
            />,
        );

        expect(getByTestId("PopularCollectionsTable")).toBeInTheDocument();
    });

    it("renders without floor price and volume", () => {
        const collections = [new PopularCollectionFactory().withoutPrices().withoutVolume().create()];

        const { getByTestId } = render(
            <PopularCollectionsTable
                collections={collections}
                user={user}
            />,
        );

        expect(getByTestId("PopularCollectionsTable")).toBeInTheDocument();
    });

    it("visits the collection page on row click", async () => {
        const function_ = vi.fn();

        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        const { getByTestId, getAllByTestId } = render(
            <PopularCollectionsTable
                collections={collections}
                user={user}
            />,
        );

        expect(getByTestId("PopularCollectionsTable")).toBeInTheDocument();

        await userEvent.click(getAllByTestId("TableRow")[0]);

        expect(routerSpy).toHaveBeenCalled();

        routerSpy.mockRestore();
    });

    it("renders the table header for volume based on the actively selected period", () => {
        const { container } = render(
            <PopularCollectionsTable
                collections={collections}
                user={user}
                activePeriod={PeriodFilterOptions["7d"]}
            />,
        );

        expect(container).toHaveTextContent("Volume (7d)");

        const { container: container2 } = render(
            <PopularCollectionsTable
                collections={collections}
                user={user}
                activePeriod={PeriodFilterOptions["30d"]}
            />,
        );

        expect(container2).toHaveTextContent("Volume (30d)");
    });

    it("renders the volume fiat in USD if user is not logged in", () => {
        const { container } = render(
            <PopularCollectionVolume
                collection={{
                    ...collections[0],
                    volume: {
                        value: "50",
                        fiat: 10000,
                        currency: "ETH",
                        decimals: 18,
                    },
                }}
                user={null}
            />,
        );

        expect(container).toHaveTextContent("$10,000.00");
    });

    it.each(allBreakpoints)("can render the skeleton for the table item", (breakpoint) => {
        const { getByTestId } = render(
            <table>
                <tbody>
                    <PopularCollectionsTableItemSkeleton index={1} />
                </tbody>
            </table>,
            { breakpoint },
        );

        expect(getByTestId("PopularCollectionsTableItemSkeleton")).toBeInTheDocument();
    });

    it("renders the loaders if table has not fully loaded", () => {
        const { getAllByTestId } = render(
            <PopularCollectionsTable
                isLoading={true}
                user={null}
                collections={[]}
            />,
        );

        expect(getAllByTestId("PopularCollectionsTableItemSkeleton")).toHaveLength(6);
    });
});
