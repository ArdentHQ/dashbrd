import React from "react";
import { PortfolioBreakdownText } from "@/Components/PortfolioBreakdown";
import TokenPortfolioDataFactory from "@/Tests/Factories/TokenPortfolioDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("PortfolioBreakdownText", () => {
    it("should render assets", () => {
        const assets = [
            ...new TokenPortfolioDataFactory().createMany(18),
            // case no decimals and no balance
            new TokenPortfolioDataFactory().create({
                decimals: null,
                balance: null,
            }),
            // "Other" tokens
            new TokenPortfolioDataFactory().other().create(),
        ];

        render(
            <PortfolioBreakdownText
                assets={assets}
                showCount={assets.length}
            />,
        );
        expect(screen.getAllByTestId("PortfolioBreakdownText__item")).toHaveLength(assets.length);
    });

    it("should render other asset", () => {
        render(
            <PortfolioBreakdownText
                assets={[new TokenPortfolioDataFactory().create(), new TokenPortfolioDataFactory().other().create()]}
                showCount={2}
            />,
        );
        expect(screen.getAllByTestId("PortfolioBreakdownText__item")).toHaveLength(2);
    });

    it("should render based on breakpoints", () => {
        const allAssets = new TokenPortfolioDataFactory().createMany(20);

        render(
            <PortfolioBreakdownText
                assets={allAssets}
                showCount={3}
            />,
        );
        expect(screen.getAllByTestId("PortfolioBreakdownText__item")).toHaveLength(4);
    });
});
