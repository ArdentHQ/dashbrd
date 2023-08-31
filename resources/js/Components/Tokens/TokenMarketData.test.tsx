import React from "react";
import { type SpyInstance } from "vitest";
import { TokenMarketData } from "./TokenMarketData";
import { Period } from "@/Components/Tokens/Tokens.contracts";
import * as useAuth from "@/Hooks/useAuth";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { render, screen, userEvent } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

const user = new UserDataFactory().create();

const wallet = new WalletFactory().create();

const token = new TokenListItemDataFactory().create({
    total_market_cap: "100000",
});

let useAuthSpy: SpyInstance;

describe("TokenMarketData", () => {
    beforeEach(() => {
        server.use(requestMockOnce(`${BASE_URL}/price_history`, []));
        useAuthSpy = vi.spyOn(useAuth, "useAuth").mockReturnValue({
            user,
            wallet,
            authenticated: true,
            showAuthOverlay: false,
        });
    });

    afterEach(() => {
        useAuthSpy.mockRestore();
    });

    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        render(<TokenMarketData token={token} />, { breakpoint });

        expect(screen.getByText("Market Cap")).toBeTruthy();
    });

    it("should change chart period", async () => {
        render(<TokenMarketData token={token} />);

        expect(screen.getByTestId("TokenPriceChart")).toBeInTheDocument();

        for (const period of Object.values(Period)) {
            expect(screen.getByRole("tab", { name: period })).toBeInTheDocument();
        }

        expect(screen.getAllByRole("tab")[0]).toHaveAttribute("aria-selected", "true");
        expect(screen.getAllByRole("tab")[1]).not.toHaveAttribute("aria-selected", "true");

        await userEvent.click(screen.getAllByRole("tab")[1]);

        expect(screen.getAllByRole("tab")[0]).not.toHaveAttribute("aria-selected", "true");
        expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-selected", "true");
    });
});
