import { router } from "@inertiajs/react";
import React from "react";
import { type SpyInstance } from "vitest";
import { CollectionCard } from "./CollectionCard";
import * as useAuthorizedActionMock from "@/Hooks/useAuthorizedAction";
import CollectionFactory from "@/Tests/Factories/Collections/CollectionFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

const collection = new CollectionFactory().create();

let useAuthorizedActionSpy: SpyInstance;
const signedActionMock = vi.fn();

describe("ActionsPopup", () => {
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

    it.each([true, false])("should render", (isHidden) => {
        render(
            <CollectionCard
                isHidden={isHidden}
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.getByTestId("CollectionCard")).toBeInTheDocument();
    });

    it("should render", () => {
        render(
            <CollectionCard
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.getByTestId("CollectionCard")).toBeInTheDocument();
    });

    it("visits the collection page on click", async () => {
        const function_ = vi.fn();
        const routerSpy = vi.spyOn(router, "visit").mockImplementation(function_);

        render(
            <CollectionCard
                isHidden={false}
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        await userEvent.click(screen.getByTestId("CollectionCard"));

        expect(routerSpy).toHaveBeenCalled();
    });

    it("should render with default currency settings", () => {
        const collection = new CollectionFactory().create({
            floorPriceCurrency: null,
            floorPriceDecimals: null,
            floorPrice: (123 * 1e18).toString(),
        });

        render(
            <CollectionCard
                isHidden={false}
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.getByTestId("CollectionFloorPrice__crypto")).toHaveTextContent("123 ETH");
    });

    it("should render with custom currency settings", () => {
        const collection = new CollectionFactory().create({
            floorPriceCurrency: "MATIC",
            floorPriceDecimals: 16,
            floorPrice: (123 * 1e18).toString(),
        });

        render(
            <CollectionCard
                isHidden={false}
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.getByTestId("CollectionFloorPrice__crypto")).toHaveTextContent("12,300 MATIC");
    });

    it("should render with fallback values", () => {
        const collection = new CollectionFactory().create({
            image: null,
            floorPrice: null,
        });

        render(
            <CollectionCard
                isHidden={false}
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.getByTestId("CollectionCard")).toBeInTheDocument();
    });

    it("does not render floor price if null", () => {
        const collection = new CollectionFactory().create({
            image: null,
            floorPrice: null,
            floorPriceDecimals: null,
        });

        render(
            <CollectionCard
                isHidden={false}
                collection={collection}
                onChanged={vi.fn()}
            />,
        );

        expect(screen.getByTestId("CollectionCard")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCard__unknown-floor-price")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCard__unknown-value")).toBeInTheDocument();
    });
});
