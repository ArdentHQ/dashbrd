import React from "react";
import { PortfolioBreakdownLine } from "@/Components/PortfolioBreakdown";
import TokenPortfolioDataFactory from "@/Tests/Factories/TokenPortfolioDataFactory";
import { render, screen } from "@/Tests/testing-library";

describe("PortfolioBreakdownLine", () => {
    const symbolAttribute = "data-symbol";

    const assets = [
        new TokenPortfolioDataFactory().create({
            symbol: "BRDY",
        }),
        new TokenPortfolioDataFactory().other().create(),
    ];

    it.each([[assets], [new TokenPortfolioDataFactory().createMany(20)]])("should render assets", (givenAssets) => {
        render(<PortfolioBreakdownLine assets={givenAssets} />);

        expect(screen.getAllByTestId("PortfolioBreakdownLine__item")).toHaveLength(givenAssets.length);
    });

    it("should render other asset", () => {
        render(<PortfolioBreakdownLine assets={[assets[1]]} />);
        expect(screen.getAllByTestId("PortfolioBreakdownLine__item")).toHaveLength(1);
    });

    it("should render with breakpoints and dynamically add 'other' group", () => {
        render(
            <PortfolioBreakdownLine
                assets={[assets[0], assets[0], assets[0]]}
                breakpoints={{ sm: 1, md: 2, lg: 1, xl: 3, "2xl": 3 }}
            />,
        );

        const items = screen.getAllByTestId("PortfolioBreakdownLine__item");
        expect(items).toHaveLength(5);
        expect(items[0]).toHaveAttribute(symbolAttribute, "BRDY");
        expect(items[1]).toHaveClass("sm:hidden", "md:inline-block", "lg:hidden", "xl:inline-block");
        expect(items[1]).toHaveAttribute(symbolAttribute, "BRDY");
        expect(items[2]).toHaveClass("sm:hidden", "xl:inline-block");
        expect(items[2]).not.toHaveClass("md:inline-block", "lg:hidden");
        expect(items[2]).toHaveAttribute(symbolAttribute, "BRDY");

        // Other Groups
        expect(items[3]).toHaveClass("hidden", "sm:inline-block", "md:hidden", "lg:inline-block", "xl:hidden");
        expect(items[3]).toHaveAttribute(symbolAttribute, "Other");
        expect(items[4]).toHaveClass("hidden", "md:inline-block", "lg:hidden");
        expect(items[4]).toHaveAttribute(symbolAttribute, "Other");
    });

    it("should not duplicate with breakpoint class names", () => {
        render(
            <PortfolioBreakdownLine
                assets={[assets[0], assets[0], assets[0]]}
                breakpoints={{ sm: 3, md: 3, lg: 2, xl: 1, "2xl": 1 }}
            />,
        );

        const items = screen.getAllByTestId("PortfolioBreakdownLine__item");
        expect(items).toHaveLength(5);
        expect(items[0]).toHaveAttribute(symbolAttribute, "BRDY");

        expect(items[1]).toHaveClass("xl:hidden");
        expect(items[1]).toHaveAttribute(symbolAttribute, "BRDY");

        expect(items[2]).toHaveClass("lg:hidden");
        expect(items[2]).toHaveAttribute(symbolAttribute, "BRDY");

        // Other Groups
        expect(items[3]).toHaveClass("hidden", "lg:inline-block", "xl:hidden");
        expect(items[3]).toHaveAttribute(symbolAttribute, "Other");
        expect(items[4]).toHaveClass("hidden", "xl:inline-block");
        expect(items[4]).toHaveAttribute(symbolAttribute, "Other");
    });

    it("should not output items outside of all breakpoints", () => {
        render(
            <PortfolioBreakdownLine
                assets={[assets[0], assets[0], assets[0], assets[0], assets[0], assets[0]]}
                breakpoints={{ sm: 1, md: 1, lg: 1, xl: 1, "2xl": 1 }}
            />,
        );

        const items = screen.getAllByTestId("PortfolioBreakdownLine__item");
        expect(items).toHaveLength(2);

        expect(items[0]).toHaveAttribute(symbolAttribute, "BRDY");
        expect(items[1]).toHaveAttribute(symbolAttribute, "Other");
    });

    it("should not output multiple 'other' groups if passed in", () => {
        render(
            <PortfolioBreakdownLine
                assets={[assets[0], assets[0], assets[1]]}
                breakpoints={{ sm: 3, md: 3, lg: 3, xl: 3, "2xl": 3 }}
            />,
        );

        const items = screen.getAllByTestId("PortfolioBreakdownLine__item");
        expect(items).toHaveLength(3);

        expect(items[0]).toHaveAttribute(symbolAttribute, "BRDY");
        expect(items[1]).toHaveAttribute(symbolAttribute, "BRDY");
        expect(items[2]).toHaveAttribute(symbolAttribute, "Other");
    });
});
