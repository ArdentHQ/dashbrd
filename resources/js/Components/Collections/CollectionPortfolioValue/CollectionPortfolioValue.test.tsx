import React from "react";
import { CollectionPortfolioValue } from "./CollectionPortfolioValue";
import TokenDataFactory from "@/Tests/Factories/Token/TokenDataFactory";
import { render, screen } from "@/Tests/testing-library";
import { Breakpoint, allBreakpoints } from "@/Tests/utils";

describe("CollectionName", () => {
    it.each(allBreakpoints)("should render on %s", (breakpoint) => {
        render(
            <CollectionPortfolioValue
                value="1001000000000000000"
                token={new TokenDataFactory().create({
                    symbol: "ETH",
                    name: "ETH",
                    decimals: 18,
                })}
                convertedValue="3508.09"
            />,
            { breakpoint },
        );

        expect(screen.getByTestId("CollectionPortfolioValue")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionPortfolioValue__crypto").textContent).toEqual("1.001 ETH");
    });

    it("should render", () => {
        render(
            <CollectionPortfolioValue
                value="1001000000000000000"
                token={new TokenDataFactory().create({
                    symbol: "ETH",
                    name: "ETH",
                    decimals: 18,
                })}
                convertedValue="3508.09"
            />,
            { breakpoint: Breakpoint.sm },
        );

        expect(screen.getByTestId("CollectionPortfolioValue")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionPortfolioValue__crypto").textContent).toEqual("1.001 ETH");
        expect(screen.getByTestId("CollectionPortfolioValue__fiat").textContent).toEqual("$3,508.09");
    });

    it("should render on a small screen", () => {
        render(
            <CollectionPortfolioValue
                value="1001000000000000000"
                token={new TokenDataFactory().create({
                    symbol: "ETH",
                    name: "ETH",
                    decimals: 18,
                })}
                convertedValue="3508.09"
            />,
            { breakpoint: Breakpoint.xs },
        );

        expect(screen.getByTestId("CollectionPortfolioValue")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionPortfolioValue__crypto").textContent).toEqual("1.001 ETH");
        expect(screen.getByTestId("CollectionPortfolioValue__fiat").textContent).toEqual("$3.5K");
    });
});
