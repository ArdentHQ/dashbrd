import React from "react";
import { type SpyInstance } from "vitest";
import { CollectionHeaderBottom } from "./CollectionHeaderBottom";
import * as useAuth from "@/Hooks/useAuth";
import CollectionDetailDataFactory from "@/Tests/Factories/Collections/CollectionDetailDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import { render, screen, within } from "@/Tests/testing-library";
const collection = new CollectionDetailDataFactory().withCryptoCurrency("DARK").create({
    floorPrice: (1 * 1e18).toString(),
    volume: (123 * 1e18).toString(),
    supply: 9999,
    owners: 342,
    chainId: 1,
    mintedAt: null,
    floorPriceDecimals: 18,
});

let useAuthSpy: SpyInstance;

describe("CollectionHeaderBottom", () => {
    beforeEach(() => {
        const user = new UserDataFactory().create();

        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet: null,
            authenticated: false,
            showAuthOverlay: true,
        });
    });

    afterEach(() => {
        useAuthSpy.mockRestore();
    });

    it("should render", () => {
        render(<CollectionHeaderBottom collection={collection} />);

        expect(screen.getByTestId("CollectionHeaderBottom")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderBottom__floor")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderBottom__volume")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderBottom__supply")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderBottom__owners")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderBottom__created")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionHeaderBottom__chain")).toBeInTheDocument();

        expect(
            within(screen.getByTestId("CollectionHeaderBottom__floor")).getByTestId("GridHeader__value"),
        ).toHaveTextContent("1 DARK");
        expect(
            within(screen.getByTestId("CollectionHeaderBottom__volume")).getByTestId("GridHeader__value"),
        ).toHaveTextContent("123 DARK");
        expect(
            within(screen.getByTestId("CollectionHeaderBottom__supply")).getByTestId("GridHeader__value"),
        ).toHaveTextContent("9,999");
        expect(
            within(screen.getByTestId("CollectionHeaderBottom__owners")).getByTestId("GridHeader__value"),
        ).toHaveTextContent("342");
        expect(
            within(screen.getByTestId("CollectionHeaderBottom__chain")).getByTestId("GridHeader__value"),
        ).toHaveTextContent("Ethereum");
    });

    it("should handle no floor price value", () => {
        render(
            <CollectionHeaderBottom
                collection={new CollectionDetailDataFactory().withCryptoCurrency("DARK").create({
                    floorPrice: null,
                })}
            />,
        );

        const gridElement = screen.getByTestId("CollectionHeaderBottom__floor");

        expect(within(gridElement).getByTestId("GridHeader__title")).toHaveTextContent("Floor");
        expect(within(gridElement).getByTestId("GridHeader__value")).toHaveTextContent("0 DARK");
    });

    it("should handle no floor price decimals", () => {
        render(
            <CollectionHeaderBottom
                collection={new CollectionDetailDataFactory().withCryptoCurrency("DARK").create({
                    floorPrice: (3.8926 * 1e18).toString(),
                    floorPriceDecimals: null,
                })}
            />,
        );

        const gridElement = screen.getByTestId("CollectionHeaderBottom__floor");

        expect(within(gridElement).getByTestId("GridHeader__title")).toHaveTextContent("Floor");
        expect(within(gridElement).getByTestId("GridHeader__value")).toHaveTextContent("3.8926 DARK");
    });

    it("should handle no volume value", () => {
        render(
            <CollectionHeaderBottom
                collection={new CollectionDetailDataFactory().withCryptoCurrency("DARK").create({
                    volume: null,
                })}
            />,
        );

        const gridElement = screen.getByTestId("CollectionHeaderBottom__volume");

        expect(within(gridElement).getByTestId("GridHeader__title")).toHaveTextContent("Volume");
        expect(within(gridElement).getByTestId("GridHeader__value")).toHaveTextContent("0 DARK");
    });

    it("should handle no supply value", () => {
        render(
            <CollectionHeaderBottom
                collection={new CollectionDetailDataFactory().withCryptoCurrency("DARK").create({
                    supply: null,
                })}
            />,
        );

        const gridElement = screen.getByTestId("CollectionHeaderBottom__supply");

        expect(within(gridElement).getByTestId("GridHeader__title")).toHaveTextContent("Supply");
        expect(within(gridElement).getByTestId("GridHeader__value")).toHaveTextContent("N/A");
    });

    it("should handle no owners value", () => {
        render(
            <CollectionHeaderBottom
                collection={new CollectionDetailDataFactory().withCryptoCurrency("DARK").create({
                    owners: null,
                })}
            />,
        );

        const gridElement = screen.getByTestId("CollectionHeaderBottom__owners");

        expect(within(gridElement).getByTestId("GridHeader__title")).toHaveTextContent("Owners");
        expect(within(gridElement).getByTestId("GridHeader__value")).toHaveTextContent("N/A");
    });

    it("should handle no created date value", () => {
        render(<CollectionHeaderBottom collection={collection} />);

        const gridElement = screen.getByTestId("CollectionHeaderBottom__created");

        expect(within(gridElement).getByTestId("GridHeader__title")).toHaveTextContent("Created");
        expect(within(gridElement).getByTestId("GridHeader__value")).toHaveTextContent("N/A");
    });

    it("should handle created date value", () => {
        render(<CollectionHeaderBottom collection={{ ...collection, mintedAt: new Date(2020, 10, 9).getTime() }} />);

        const gridElement = screen.getByTestId("CollectionHeaderBottom__created");

        expect(within(gridElement).getByTestId("GridHeader__title")).toHaveTextContent("Created");
        expect(within(gridElement).getByTestId("GridHeader__value")).toHaveTextContent("Nov 2020");
    });

    it("should handle missing floor price token details", () => {
        render(
            <CollectionHeaderBottom
                collection={new CollectionDetailDataFactory().withCryptoCurrency(null).create({
                    floorPrice: (1 * 1e18).toString(),
                })}
            />,
        );

        expect(
            within(screen.getByTestId("CollectionHeaderBottom__floor")).getByTestId("GridHeader__value"),
        ).toHaveTextContent("1");
    });
});
