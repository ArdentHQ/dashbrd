import { router } from "@inertiajs/react";
import { expect } from "vitest";
import { CollectionsFullTable } from "@/Components/Collections/CollectionsFullTable/CollectionsFullTable";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";
import SimpleNftDataFactory from "@/Tests/Factories/Collections/SimpleNftDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

describe("CollectionsFullTable", () => {
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

    it("should render when custom sorting options are passed", () => {
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

    it("should visit the collection page on row click", async () => {
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

    // it("should sort the table when sortable heading is clicked", async () => {
    //     const sortFunction = vi.fn();
    //
    //     const { getByTestId } = render(
    //         <CollectionsFullTable
    //             collections={collections}
    //             user={user}
    //             onSort={sortFunction}
    //         />,
    //     );
    //
    //     expect(getByTestId("CollectionsTable")).toBeInTheDocument();
    //
    //     const tableHeader = screen.getAllByRole("columnheader")[0];
    //
    //     expect(tableHeader.querySelector("svg#arrow-up")).toBeInTheDocument();
    //
    //     await userEvent.click(tableHeader);
    //
    //     expect(sortFunction).toHaveBeenCalledWith({ direction: "asc", selectedChainIds: undefined, sortBy: "name" });
    // });
    //
    // it("should sort the table when sortable heading is clicked but reverse the direction", async () => {
    //     const sortFunction = vi.fn();
    //
    //     const { getByTestId } = render(
    //         <CollectionsFullTable
    //             collections={collections}
    //             user={user}
    //             onSort={sortFunction}
    //             activeSort="name"
    //             sortDirection="asc"
    //         />,
    //     );
    //
    //     expect(getByTestId("CollectionsTable")).toBeInTheDocument();
    //
    //     const tableHeader = screen.getAllByRole("columnheader")[0];
    //
    //     expect(tableHeader.querySelector("svg#arrow-up")).toBeInTheDocument();
    //
    //     await userEvent.click(tableHeader);
    //
    //     expect(sortFunction).toHaveBeenCalledWith({ direction: "desc", selectedChainIds: undefined, sortBy: "name" });
    // });
    //
    // it("should sort the table when sortable heading is clicked but reverse the direction to asc", async () => {
    //     const { getByTestId } = render(
    //         <CollectionsFullTable
    //             collections={collections}
    //             user={user}
    //         />,
    //     );
    //
    //     expect(getByTestId("CollectionsTable")).toBeInTheDocument();
    //
    //     const tableHeader = screen.getAllByRole("columnheader")[0];
    //
    //     expect(tableHeader.querySelector("svg#arrow-up")).toBeInTheDocument();
    //
    //     await userEvent.click(tableHeader);
    // });
    //
    // it("should sort the table when sortable heading is clicked but reverse the direction to asc", async () => {
    //     const sortFunction = vi.fn();
    //
    //     const { getByTestId } = render(
    //         <CollectionsFullTable
    //             collections={collections}
    //             user={user}
    //             activeSort="name"
    //             sortDirection="desc"
    //             onSort={sortFunction}
    //         />,
    //     );
    //
    //     expect(getByTestId("CollectionsTable")).toBeInTheDocument();
    //
    //     const tableHeader = screen.getAllByRole("columnheader")[0];
    //
    //     expect(tableHeader.querySelector("svg#arrow-up")).toBeInTheDocument();
    //
    //     await userEvent.click(tableHeader);
    //
    //     expect(sortFunction).toHaveBeenCalledWith({ direction: "asc", selectedChainIds: undefined, sortBy: "name" });
    // });

    it.each(allBreakpoints)("should render without crashing on %s screen if no floor price data", (breakpoint) => {
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

    it("should default fiat value to 0", () => {
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

    it("should render predefined amount of NFT images", () => {
        const nfts = new SimpleNftDataFactory().createMany(5);

        const collectionWithNfts = { ...collection, nftsCount: nfts.length, nfts };

        const { getAllByTestId } = render(
            <CollectionsFullTable
                collections={[collectionWithNfts]}
                user={user}
            />,
        );

        expect(getAllByTestId(`CollectionImages__Image`).length).toBe(2);
    });
});
