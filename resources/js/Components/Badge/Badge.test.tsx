import React from "react";
import { Badge } from "./Badge";
import { render } from "@/Tests/testing-library";

describe("Badge", () => {
    it("should render as info", () => {
        const { getByTestId } = render(<Badge>test</Badge>);

        expect(getByTestId("Badge")).toHaveClass("text-theme-secondary-500 bg-theme-secondary-100");
    });

    it("should render as danger", () => {
        const { getByTestId } = render(<Badge type="danger">test</Badge>);

        expect(getByTestId("Badge")).toHaveClass("text-theme-danger-600 bg-theme-danger-100");
    });
});
