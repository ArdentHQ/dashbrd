import React from "react";
import { TokenBalance } from "./TokenBalance";
import TokenListItemDataFactory from "@/Tests/Factories/Token/TokenListItemDataFactory";
import { render, screen } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

describe("TokenBalance", () => {
    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        const asset = new TokenListItemDataFactory().create({
            chain_id: 1,
            balance: (123 * 1e18).toString(),
            fiat_balance: "100",
            address: "0x123",
            symbol: "TEST",
            name: "Testing",
            decimals: 18,
            percentage: "0.5",
        });

        const { asFragment } = render(
            <TokenBalance
                asset={asset}
                currency="USD"
            />,
            { breakpoint },
        );

        expect(screen.getByText("$100.00")).toBeTruthy();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render 0 if an undefined fiat balance is provided", () => {
        const asset = new TokenListItemDataFactory().create({
            chain_id: 1,
            balance: (123 * 1e18).toString(),
            address: "0x123",
            fiat_balance: undefined,
            symbol: "TEST",
            name: "Testing",
            decimals: 18,
            percentage: "0.5",
        });

        const { asFragment } = render(
            <TokenBalance
                asset={asset}
                currency="USD"
            />,
        );

        expect(screen.getByText("$0.00")).toBeTruthy();
        expect(asFragment()).toMatchSnapshot();
    });
});
