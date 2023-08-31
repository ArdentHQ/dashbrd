import React from "react";
import { Tooltip } from "./Tooltip";
import { render, screen } from "@/Tests/testing-library";

describe("Tooltip", () => {
    it("should render with tooltip", () => {
        render(
            <Tooltip>
                <span data-testid="test"></span>
            </Tooltip>,
        );

        expect(screen.getByTestId("test")).toBeInTheDocument();
    });
});
