import React from "react";
import { type SpyInstance } from "vitest";
import { TokenDetails } from "./TokenDetails";
import * as useAuth from "@/Hooks/useAuth";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { render, screen } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

const user = new UserDataFactory().create();

const wallet = new WalletFactory().create();

let useAuthSpy: SpyInstance;

const defaultProperties: Partial<App.Data.TokenListItemData> = {
    total_market_cap: "5000",
    token_price: "1234567",
    total_volume: "1234567",
    minted_supply: "1234567",
    ath: "1234567",
    atl: "1234567",
};

describe("TokenDetails", () => {
    beforeEach(() => {
        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet,
            authenticated: true,
            showAuthOverlay: false,
            showCloseButton: false,
            closeOverlay: vi.fn(),
        });
    });

    afterEach(() => {
        useAuthSpy.mockRestore();
    });

    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        const token = new TokenListItemDataFactory().create({
            ...defaultProperties,
        });

        render(<TokenDetails token={token} />, { breakpoint });

        expect(screen.getByTestId("TokenDetails__marketcap")).toBeInTheDocument();
        expect(screen.getByTestId("TokenDetails__volume")).toBeInTheDocument();
        expect(screen.getByTestId("TokenDetails__supply")).toBeInTheDocument();
        expect(screen.getByTestId("TokenDetails__ath")).toBeInTheDocument();
        expect(screen.getByTestId("TokenDetails__atl")).toBeInTheDocument();
    });

    it("should render with 0 as token price if not defined", () => {
        const token = new TokenListItemDataFactory().create({
            ...defaultProperties,
            token_price: null,
        });

        render(<TokenDetails token={token} />);

        expect(screen.getByTestId("TokenDetails__marketcap")).toBeTruthy();
    });

    it("should render without marketcap", () => {
        const token = new TokenListItemDataFactory().create({
            ...defaultProperties,
            total_market_cap: null,
        });

        render(<TokenDetails token={token} />);

        expect(screen.queryByTestId("TokenDetails__marketcap")).not.toBeInTheDocument();
    });

    it("should render without total_volume", () => {
        const token = new TokenListItemDataFactory().create({
            ...defaultProperties,
            total_volume: null,
        });

        render(<TokenDetails token={token} />);

        expect(screen.queryByTestId("TokenDetails__volume")).not.toBeInTheDocument();
    });

    it("should render without minted_supply", () => {
        const token = new TokenListItemDataFactory().create({
            ...defaultProperties,
            minted_supply: null,
        });

        render(<TokenDetails token={token} />);

        expect(screen.queryByTestId("TokenDetails__supply")).not.toBeInTheDocument();
    });

    it("should render without ath", () => {
        const token = new TokenListItemDataFactory().create({
            ...defaultProperties,
            ath: null,
        });

        render(<TokenDetails token={token} />);

        expect(screen.queryByTestId("TokenDetails__ath")).not.toBeInTheDocument();
    });
    it("should render without atl", () => {
        const token = new TokenListItemDataFactory().create({
            ...defaultProperties,
            atl: null,
        });

        render(<TokenDetails token={token} />);

        expect(screen.queryByTestId("TokenDetails__atl")).not.toBeInTheDocument();
    });
});
