import React from "react";
import { NetworkIcon } from "./NetworkIcon";
import { render, screen } from "@/Tests/testing-library";

describe("NetworkIcon", () => {
    it.each([137, 80001])("should render polygon logo for polygon networks", (networkId) => {
        render(<NetworkIcon networkId={networkId as 137 | 80001} />);

        expect(screen.getByTestId("Polygon")).toBeInTheDocument();
    });

    it.each([1, 5])("should render ethereum logo for ethereum networks", (networkId) => {
        render(<NetworkIcon networkId={networkId as 1 | 5} />);

        expect(screen.getByTestId("Ethereum")).toBeInTheDocument();
    });

    it.each([137, 80001])("should render without tooltip for polygon networks", (networkId) => {
        render(
            <NetworkIcon
                networkId={networkId as 137 | 80001}
                withoutTooltip
            />,
        );

        expect(screen.getByTestId("Polygon")).toBeInTheDocument();
        expect(screen.getByTestId("Polygon__text")).toHaveTextContent("Polygon");
    });

    it.each([1, 5])("should render ethereum logo for ethereum networks", (networkId) => {
        render(
            <NetworkIcon
                networkId={networkId as 1 | 5}
                withoutTooltip
            />,
        );

        expect(screen.getByTestId("Ethereum")).toBeInTheDocument();
        expect(screen.getByTestId("Ethereum__text")).toHaveTextContent("Ethereum");
    });

    const sizes: Array<["sm" | "md" | "xl", string]> = [
        ["sm", "w-3.5 h-3.5"],
        ["md", "w-5 h-5"],
        ["xl", "w-8 h-8"],
    ];
    it.each(sizes)("should render network icon with different size", (size, className) => {
        render(
            <NetworkIcon
                networkId={1}
                iconSize={size}
            />,
        );

        expect(screen.getByTestId("Ethereum")).toBeInTheDocument();
        expect(screen.getByTestId("NetworkIcon").getElementsByTagName("div")[0]).toHaveAttribute("class", className);
    });
});
