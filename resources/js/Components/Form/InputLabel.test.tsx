import React from "react";
import { InputLabel } from "@/Components/Form/InputLabel";
import { render, screen } from "@/Tests/testing-library";

describe("InputLabel", () => {
    it("should render", () => {
        render(
            <InputLabel>
                <div data-testid="test"></div>
            </InputLabel>,
        );

        expect(screen.getByTestId("InputLabel")).toBeInTheDocument();
        expect(screen.getByTestId("test")).toBeInTheDocument();
    });

    it("should render with value property", () => {
        render(<InputLabel value="test" />);

        expect(screen.getByTestId("InputLabel")).toBeInTheDocument();
        expect(screen.getByText("test")).toBeInTheDocument();
    });
});
