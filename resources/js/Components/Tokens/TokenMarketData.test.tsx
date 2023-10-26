import React from "react";
import { TokenMarketData } from "./TokenMarketData";
import { Period } from "@/Components/Tokens/Tokens.contracts";
import * as useDarkModeContext from "@/Contexts/DarkModeContex";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import UserDataFactory from "@/Tests/Factories/UserDataFactory";
import WalletFactory from "@/Tests/Factories/Wallet/WalletFactory";
import { BASE_URL, requestMockOnce, server } from "@/Tests/Mocks/server";
import { mockAuthContext, render, screen, userEvent } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

const user = new UserDataFactory().create();

const wallet = new WalletFactory().create();

const token = new TokenListItemDataFactory().create({
    total_market_cap: "100000",
});

let resetAuthContext: () => void;

describe("TokenMarketData", () => {
    beforeEach(() => {
        vi.spyOn(useDarkModeContext, "useDarkModeContext").mockReturnValue({ isDark: false, toggleDarkMode: vi.fn() });

        server.use(requestMockOnce(`${BASE_URL}/price_history`, []));

        resetAuthContext = mockAuthContext({
            user,
            wallet,
        });
    });

    afterEach(() => {
        resetAuthContext();
        vi.restoreAllMocks();
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
