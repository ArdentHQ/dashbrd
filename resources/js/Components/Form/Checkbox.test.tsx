import React from "react";
import { Checkbox } from "@/Components/Form/Checkbox";
import { render, screen } from "@/Tests/testing-library";

describe("Checkbox", () => {
    it("should render", () => {
        render(<Checkbox />);

        expect(screen.getByTestId("Checkbox")).toBeInTheDocument();
    });

    it("should render as invalid", () => {
        render(<Checkbox isInvalid />);

        expect(screen.getByTestId("Checkbox")).toBeInTheDocument();
        expect(screen.getByTestId("Checkbox")).toHaveClass("border-theme-danger-400");
    });
});
