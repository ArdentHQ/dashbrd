import React from "react";
import { SaveButton } from "@/Components/Buttons/SaveButton";
import { render, screen } from "@/Tests/testing-library";

describe("SaveButton", () => {
    it("should render", () => {
        render(
            <SaveButton icon="Heart">
                <span data-testid="test"></span>
            </SaveButton>,
        );

        expect(screen.getByRole("button")).toHaveClass("button-save");

        expect(screen.getByRole("button")).not.toHaveClass("button-save-selected");

        expect(screen.getByTestId("icon-Heart")).toBeInTheDocument();
    });

    it("should render with the bookmark icon by default", () => {
        render(<SaveButton />);

        expect(screen.getByTestId("icon-Bookmark")).toBeInTheDocument();
    });

    it("should apply the selected class if selected", () => {
        render(
            <SaveButton
                icon="Heart"
                selected
            >
                <span data-testid="test"></span>
            </SaveButton>,
        );

        expect(screen.getByRole("button")).toHaveClass("button-save-selected");
    });
});
