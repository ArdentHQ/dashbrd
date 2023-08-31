import React from "react";
import { PortfolioBreakdownTable } from "@/Components/PortfolioBreakdown";
import TokenPortfolioDataFactory from "@/Tests/Factories/TokenPortfolioDataFactory";
import { render, screen, userEvent } from "@/Tests/testing-library";

describe("PortfolioBreakdownTable", () => {
    const assets = [new TokenPortfolioDataFactory().create(), new TokenPortfolioDataFactory().other().create()];

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
            <PortfolioBreakdownTable
                assets={assets}
                currency="USD"
            />,
        );
        expect(screen.getAllByRole("row")).toHaveLength(assets.length + 1);
    });

    it("should render other asset", () => {
        render(
            <PortfolioBreakdownTable
                assets={assets}
                currency="USD"
            />,
        );

        expect(screen.getAllByRole("row")).toHaveLength(3);
    });

    it("should reverse sort on click", async () => {
        render(
            <PortfolioBreakdownTable
                assets={assets}
                currency="USD"
            />,
        );

        const topEntry = screen.getAllByRole("row")[1]; // [0] is th, [1] is first entry
        expect(screen.getAllByRole("row")).toHaveLength(3);

        let percentHeading = screen.getByTestId("table__th--2");

        await userEvent.click(percentHeading);

        expect(screen.getAllByRole("row")).toHaveLength(3);

        let topEntrySorted = screen.getAllByRole("row")[1]; // [0] is th, [1] is first entry
        expect(topEntry).not.toEqual(topEntrySorted);

        percentHeading = screen.getByTestId("table__th--2");

        await userEvent.click(percentHeading);

        expect(screen.getAllByRole("row")).toHaveLength(3);

        topEntrySorted = screen.getAllByRole("row")[1]; // [0] is th, [1] is first entry
        expect(topEntry).toEqual(topEntrySorted);
    });

    it("should sort percentages ascending", () => {
        // assets in "random" percent order to fully test sorting returns
        render(
            <PortfolioBreakdownTable
                assets={[
                    {
                        ...assets[0],
                        percentage: "0.81284",
                    },
                    {
                        ...assets[0],
                        percentage: "0.0517",
                    },
                    {
                        ...assets[0],
                        percentage: "0.10429",
                    },
                    {
                        ...assets[1],
                        percentage: "0.03117",
                    },
                ]}
                currency="USD"
            />,
        );

        const rows = screen.getAllByRole("row").slice(1);

        expect(rows).toHaveLength(4);
        expect(rows[0]).toHaveTextContent("81.3%");
        expect(rows[1]).toHaveTextContent("10.4%");
        expect(rows[2]).toHaveTextContent("5.2%");
        expect(rows[3]).toHaveTextContent("3.1%");
    });

    it("should sort percentages descending", async () => {
        // assets in "random" percent order to fully test sorting returns
        render(
            <PortfolioBreakdownTable
                assets={[
                    {
                        ...assets[0],
                        percentage: "0.81284",
                    },
                    {
                        ...assets[0],
                        percentage: "0.0517",
                    },
                    {
                        ...assets[0],
                        percentage: "0.10429",
                    },
                    {
                        ...assets[1],
                        percentage: "0.03117",
                    },
                ]}
                currency="USD"
            />,
        );
        const percentHeading = screen.getByTestId("table__th--2");

        await userEvent.click(percentHeading);

        const rows = screen.getAllByRole("row").slice(1);

        expect(rows[0]).toHaveTextContent("3.1%");
        expect(rows[1]).toHaveTextContent("5.2%");
        expect(rows[2]).toHaveTextContent("10.4%");
        expect(rows[3]).toHaveTextContent("81.3%");
    });

    it("should handle sort with identical percentages", async () => {
        render(
            <PortfolioBreakdownTable
                assets={[
                    {
                        ...assets[0],
                        percentage: "0.5",
                    },
                    {
                        ...assets[1],
                        percentage: "0.5",
                    },
                ]}
                currency="USD"
            />,
        );

        const topEntry = screen.getAllByRole("row")[1]; // [0] is th, [1] is first entry
        expect(screen.getAllByRole("row")).toHaveLength(3);

        const percentHeading = screen.getByTestId("table__th--2");

        await userEvent.click(percentHeading);

        expect(screen.getAllByRole("row")).toHaveLength(3);

        const topEntrySorted = screen.getAllByRole("row")[1]; // [0] is th, [1] is first entry
        expect(topEntry).not.toEqual(topEntrySorted); // should still reverse it
    });
});
