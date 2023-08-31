import React from "react";
import { PriceChange } from "./PriceChange";
import { render, screen } from "@/Tests/testing-library";

describe("PriceChange", () => {
    it("should render", () => {
        render(<PriceChange change={2} />);
        expect(screen.getByTestId("PriceChange")).toBeInTheDocument();
    });

    it("should render neutral change", () => {
        render(<PriceChange change={0} />);
        expect(screen.getByTestId("PriceChange__wrapper")).toHaveClass("text-theme-secondary-700");
    });

    it("should render positive change", () => {
        render(<PriceChange change={1} />);
        expect(screen.getByTestId("PriceChange__wrapper")).toHaveClass("text-theme-success-600");
    });

    it("should render negative change", () => {
        render(<PriceChange change={-2} />);
        expect(screen.getByTestId("PriceChange__wrapper")).toHaveClass("text-theme-danger-400");
    });
});
