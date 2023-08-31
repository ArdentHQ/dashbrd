import React from "react";
import { DonutGraph } from "./DonutGraph";
import { type GraphDataPoint } from "@/Components/Graphs/Graphs.contracts";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";

describe("DonutGraph", () => {
    const data: GraphDataPoint[] = [
        { data: { index: 1, label: "item 1", value: 50 }, value: 50, formatted: "50%" },
        { data: { index: 2, label: "item 2", value: 30 }, value: 30, formatted: "30%" },
        { data: { index: 3, label: "item 3", value: 20 }, value: 20, formatted: "20%" },
    ];

    it("should render", () => {
        render(
            <DonutGraph
                size={100}
                data={data}
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);
    });

    it("should render tooltip on hover", async () => {
        render(
            <DonutGraph
                size={100}
                data={data}
                renderTooltip={(dataPoint) => (
                    <div data-testid="TooltipContent">
                        {dataPoint.data.label} value: {dataPoint.value}
                    </div>
                )}
            />,
        );

        expect(screen.getByTestId("TooltipContainer")).toBeInTheDocument();
        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);

        expect(screen.queryByTestId("TooltipContent")).not.toBeInTheDocument();

        await userEvent.hover(screen.getAllByTestId("DonutGraph__item-hover-area")[0]);

        expect(screen.getByTestId("TooltipContent")).toBeInTheDocument();
        expect(screen.getByTestId("TooltipContent")).toHaveTextContent("item 1 value: 50");

        await userEvent.unhover(screen.getAllByTestId("DonutGraph__item-hover-area")[2]);
        await userEvent.hover(screen.getAllByTestId("DonutGraph__item-hover-area")[1]);

        expect(screen.getByTestId("TooltipContent")).toHaveTextContent("item 2 value: 30");

        await userEvent.unhover(screen.getAllByTestId("DonutGraph__item-hover-area")[1]);

        await waitFor(() => {
            expect(screen.getByTestId("TooltipContainer")).toHaveClass("hidden");
        });
    });

    it("should render content inside the circle", () => {
        render(
            <DonutGraph
                size={100}
                data={data}
            >
                <div data-testid="Content">content</div>
            </DonutGraph>,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(3);
        expect(screen.getByTestId("Content")).toBeInTheDocument();
    });

    it("should show an empty solid block if no data", () => {
        render(
            <DonutGraph
                size={100}
                data={[]}
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(1);
    });

    it("should render with two items with zero values", () => {
        render(
            <DonutGraph
                size={100}
                data={[
                    {
                        data: { index: 3, label: "item 3", value: 0 },
                        value: 0,
                        formatted: "20%",
                    },
                    {
                        data: { index: 3, label: "item 3", value: 0 },
                        value: 0,
                        formatted: "20%",
                    },
                ]}
            />,
        );

        expect(screen.getByTestId("DonutGraph__svg")).toBeInTheDocument();
        expect(screen.getAllByTestId("DonutGraph__item")).toHaveLength(2);
    });
});
