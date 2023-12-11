import { router } from "@inertiajs/react";
import { type SpyInstance } from "vitest";
import { CollectionsFullTable } from "@/Components/Collections/CollectionsFullTable/CollectionsFullTable";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

let useAuthorizedActionSpy: SpyInstance;
const signedActionMock = vi.fn();

describe("CollectionsTable", () => {
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

    const collections = new CollectionFactory().withPrices().createMany(3);

    const collection = new CollectionFactory().withoutPrices().create();

    const collectionsWithNoFloorPriceCurrencyData: App.Data.Collections.CollectionData[] = [
        {
            ...collection,
            floorPriceCurrency: null,
            floorPriceDecimals: null,
        },
    ];

    const collectionsWithNullFloorPriceFiatData: App.Data.Collections.CollectionData[] = [
        {
            ...collection,
            floorPriceFiat: null,
        },
    ];

    const collectionsWithNullFloorPriceData: App.Data.Collections.CollectionData[] = [
        {
            ...collection,
            floorPrice: null,
        },
    ];

    const user = new UserDataFactory().create();

    it.each(allBreakpoints)("renders without crashing on %s screen", (breakpoint) => {
        const { getByTestId } = render(
            <CollectionsFullTable
                collections={collections}
                user={user}
            />,
            { breakpoint },
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();
    });

    it("renders when custom sorting options are passed", () => {
        const { getByTestId } = render(
            <CollectionsFullTable
                collections={collections}
                user={user}
            />,
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();
    });

    it("should not render if there are no collections", () => {
        render(
            <CollectionsFullTable
                collections={[]}
                user={user}
            />,
        );

        expect(screen.queryByTestId("CollectionsTable")).not.toBeInTheDocument();
    });

    it("visits the collection page on row click", async () => {
        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        const { getByTestId, getAllByTestId } = render(
            <CollectionsFullTable
                collections={collections}
                user={user}
            />,
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();

        await userEvent.click(getAllByTestId("TableRow")[0]);

        expect(routerSpy).toHaveBeenCalled();
    });

    it("can sort the table when sortable heading is clicked", async () => {
        const sortFunction = vi.fn();

        const { getByTestId } = render(
            <CollectionsFullTable
                collections={collections}
                user={user}
            />,
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();

        const tableHeader = screen.getAllByRole("columnheader")[0];

        expect(tableHeader.querySelector("svg#arrow-up")).toBeInTheDocument();

        await userEvent.click(tableHeader);

        expect(sortFunction).toHaveBeenCalledWith({ direction: "asc", selectedChainIds: undefined, sortBy: "name" });
    });

    it("can sort the table when sortable heading is clicked but reverse the direction", async () => {
        const sortFunction = vi.fn();

        const { getByTestId } = render(
            <CollectionsFullTable
                collections={collections}
                user={user}
            />,
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();

        const tableHeader = screen.getAllByRole("columnheader")[0];

        expect(tableHeader.querySelector("svg#arrow-up")).toBeInTheDocument();

        await userEvent.click(tableHeader);

        expect(sortFunction).toHaveBeenCalledWith({ direction: "desc", selectedChainIds: undefined, sortBy: "name" });
    });

    it("can sort the table when sortable heading is clicked but reverse the direction to asc", async () => {
        const { getByTestId } = render(
            <CollectionsFullTable
                collections={collections}
                user={user}
            />,
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();

        const tableHeader = screen.getAllByRole("columnheader")[0];

        expect(tableHeader.querySelector("svg#arrow-up")).toBeInTheDocument();

        await userEvent.click(tableHeader);
    });

    it.each(allBreakpoints)("renders without crashing on %s screen if no floor price data", (breakpoint) => {
        const { getByTestId } = render(
            <CollectionsFullTable
                collections={collectionsWithNoFloorPriceCurrencyData}
                user={user}
            />,
            { breakpoint },
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();
    });

    it("should render when floor price fiat is null", () => {
        const { getByTestId } = render(
            <CollectionsFullTable
                collections={collectionsWithNullFloorPriceFiatData}
                user={user}
            />,
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();
    });

    it("should render when floor price is null", () => {
        const { getByTestId } = render(
            <CollectionsFullTable
                collections={collectionsWithNullFloorPriceData}
                user={user}
            />,
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();
        expect(getByTestId("CollectionsTableItem__unknown-floor-price")).toBeInTheDocument();
        expect(getByTestId("CollectionsTableItem__unknown-value")).toBeInTheDocument();
    });

    it("defaults fiat value to 0", () => {
        const { getByTestId, queryByTestId } = render(
            <CollectionsFullTable
                collections={[
                    {
                        ...collection,
                        floorPrice: "1000",
                        floorPriceFiat: null,
                    },
                ]}
                user={user}
            />,
        );

        expect(getByTestId("CollectionsTable")).toBeInTheDocument();
        expect(queryByTestId("CollectionsTableItem__unknown-floor-price")).not.toBeInTheDocument();
        expect(queryByTestId("CollectionsTableItem__unknown-value")).not.toBeInTheDocument();
        expect(getByTestId("CollectionPortfolioValue__fiat")).toBeInTheDocument();
    });
});
