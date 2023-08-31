import React from "react";
import { Badge } from "./Badge";
import { render, screen } from "@/Tests/testing-library";

describe("Badge", () => {
    it("should render as info", () => {
        render(<Badge>test</Badge>);
        expect(screen.getByTestId("Badge")).toHaveClass("text-theme-secondary-500 bg-theme-secondary-100");
    });

    it("should render as danger", () => {
        render(<Badge type="danger">test</Badge>);
        expect(screen.getByTestId("Badge")).toHaveClass("text-theme-danger-600 bg-theme-danger-100");
    });
});
