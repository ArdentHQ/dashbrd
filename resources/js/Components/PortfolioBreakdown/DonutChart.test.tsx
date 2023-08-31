import React from "react";
import { DonutChart } from "./DonutChart";
import TokenPortfolioDataFactory from "@/Tests/Factories/TokenPortfolioDataFactory";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";

describe("DonutChart", () => {
    const itemHoverArea = "DonutGraph__item-hover-area";

    const assets = [
        new TokenPortfolioDataFactory().create({
            symbol: "item 1",
            balance: "250",
            fiat_balance: "250",
            percentage: "0.5",
        }),
        new TokenPortfolioDataFactory().create({
            symbol: "item 2",
            balance: "125",
            fiat_balance: "125",
            percentage: "0.25",
        }),
        new TokenPortfolioDataFactory().create({
            symbol: "item 3",
            balance: "120",
            fiat_balance: "120",
            percentage: "0.24",
        }),
        new TokenPortfolioDataFactory().create({
            symbol: "item 4",
            balance: "5",
            fiat_balance: "5",
            percentage: "0.01",
        }),
    ];

    it("should render", () => {
        render(
            <DonutChart
                assets={assets}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);
    });

    it("should group small values into 'other'", () => {
        const assets = [
            new TokenPortfolioDataFactory().create({
                balance: "270",
                fiat_balance: "270",
                percentage: "0.675",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "100",
                fiat_balance: "100",
                percentage: "0.25",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "10",
                fiat_balance: "10",
                percentage: "0.025",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "10",
                fiat_balance: "10",
                percentage: "0.025",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "10",
                fiat_balance: "10",
                percentage: "0.025",
            }),
        ];

        render(
            <DonutChart
                assets={assets}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);
    });

    it("should hide small values", () => {
        const assets = [
            new TokenPortfolioDataFactory().create({
                balance: "196",
                fiat_balance: "196",
                percentage: "0.4109",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "100",
                fiat_balance: "100",
                percentage: "0.2096",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "30",
                fiat_balance: "30",
                percentage: "0.628",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "30",
                fiat_balance: "30",
                percentage: "0.0628",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "30",
                fiat_balance: "30",
                percentage: "0.0628",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "30",
                fiat_balance: "30",
                percentage: "0.0628",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "30",
                fiat_balance: "30",
                percentage: "0.0628",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "30",
                fiat_balance: "30",
                percentage: "0.0628",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "1",
                fiat_balance: "1",
                percentage: "0.002",
            }),
        ];

        render(
            <DonutChart
                assets={assets}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(6);
    });

    it("should hide 'other' group if too small", () => {
        const assets = [
            new TokenPortfolioDataFactory().create({
                balance: "196",
                fiat_balance: "196",
                percentage: "0.6468",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "100",
                fiat_balance: "100",
                percentage: "0.33",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "1",
                fiat_balance: "1",
                percentage: "0.0033",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "1",
                fiat_balance: "1",
                percentage: "0.0033",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "1",
                fiat_balance: "1",
                percentage: "0.0033",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "1",
                fiat_balance: "1",
                percentage: "0.0033",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "1",
                fiat_balance: "1",
                percentage: "0.0033",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "1",
                fiat_balance: "1",
                percentage: "0.0033",
            }),
            new TokenPortfolioDataFactory().create({
                balance: "1",
                fiat_balance: "1",
                percentage: "0.0033",
            }),
        ];

        render(
            <DonutChart
                assets={assets}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(2);
    });

    it("should render tooltip on hover", async () => {
        render(
            <DonutChart
                assets={assets}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("TooltipContainer")).toBeInTheDocument();
        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);

        expect(screen.queryByTestId("DonutChart__tooltip")).not.toBeInTheDocument();

        await userEvent.hover(screen.getAllByTestId(itemHoverArea)[0]);

        expect(screen.getByTestId("DonutChart__tooltip")).toBeInTheDocument();
        expect(screen.getByTestId("DonutChart__tooltip-label")).toHaveTextContent("item 1");
        expect(screen.getByTestId("DonutChart__tooltip-percentage")).toHaveTextContent("50%");

        await userEvent.unhover(screen.getAllByTestId(itemHoverArea)[2]);
        await userEvent.hover(screen.getAllByTestId(itemHoverArea)[1]);

        expect(screen.getByTestId("DonutChart__tooltip-label")).toHaveTextContent("item 2");
        expect(screen.getByTestId("DonutChart__tooltip-percentage")).toHaveTextContent("25%");

        await userEvent.unhover(screen.getAllByTestId(itemHoverArea)[1]);

        await waitFor(() => {
            expect(screen.getByTestId("TooltipContainer")).toHaveClass("hidden");
        });
    });

    it("should render content inside the circle", () => {
        render(
            <DonutChart
                assets={assets}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);
        expect(screen.getByTestId("DonutChart__content")).toBeInTheDocument();
        expect(screen.getByTestId("DonutChart__content")).toHaveTextContent("My Balance");
        expect(screen.getByTestId("DonutChart__content")).toHaveTextContent("$500.00");
    });

    it("should show solid block if a single asset", async () => {
        render(
            <DonutChart
                size={100}
                assets={[assets[0]]}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(1);
        expect(screen.queryByTestId("DonutChart__tooltip")).not.toBeInTheDocument();

        await userEvent.hover(screen.getAllByTestId(itemHoverArea)[0]);

        expect(screen.getByTestId("DonutChart__tooltip")).toBeInTheDocument();
        expect(screen.getByTestId("DonutChart__tooltip-label")).toHaveTextContent("item 1");
        expect(screen.getByTestId("DonutChart__tooltip-percentage")).toHaveTextContent("50%");
    });

    it("should show an empty solid block if no data", async () => {
        render(
            <DonutChart
                size={100}
                assets={[]}
                currency="USD"
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(1);
        expect(screen.queryByTestId("DonutChart__tooltip")).not.toBeInTheDocument();

        await userEvent.hover(screen.getAllByTestId(itemHoverArea)[0]);

        expect(screen.queryByTestId("DonutChart__tooltip")).not.toBeInTheDocument();
    });
});
