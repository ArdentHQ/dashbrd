import { type SpyInstance } from "vitest";
import { PopularCollectionsTable } from "./PopularCollectionsTable";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import PopularCollectionFactory from "@/Tests/Factories/Collections/PopularCollectionFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { render } from "@/Tests/testing-library";
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

    const collections = new PopularCollectionFactory().createMany(3);

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
});
