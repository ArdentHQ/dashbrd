import React from "react";
import { Radio } from "@/Components/Form/Radio";
import { render, screen } from "@/Tests/testing-library";

describe("Radio", () => {
    it("should render", () => {
        render(<Radio />);

        expect(screen.getByTestId("Radio")).toBeInTheDocument();
    });

    it("should render as invalid", () => {
        render(<Radio isInvalid />);

        expect(screen.getByTestId("Radio")).toBeInTheDocument();
        expect(screen.getByTestId("Radio")).toHaveClass("border-theme-danger-400");
    });
});
