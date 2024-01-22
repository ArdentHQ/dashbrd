import { router } from "@inertiajs/react";
import { type SpyInstance } from "vitest";
import { PopularCollectionsTable } from "./PopularCollectionsTable";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import { PeriodFilterOptions } from "@/Pages/Collections/Components/CollectionsFilterTabs";
import PopularCollectionFactory from "@/Tests/Factories/Collections/PopularCollectionFactory";
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
            floorPriceChange: 50,
        }),
        ...new PopularCollectionFactory().createMany(2, {
            floorPriceChange: null,
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
});
