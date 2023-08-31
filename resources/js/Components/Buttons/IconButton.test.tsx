import React from "react";
import { IconButton } from "@/Components/Buttons/IconButton";
import { render, screen } from "@/Tests/testing-library";

describe("IconButton", () => {
    it("should render", () => {
        render(
            <IconButton icon="ArrowUp">
                <span data-testid="test"></span>
            </IconButton>,
        );

        expect(screen.getByRole("button")).toBeTruthy();

        expect(screen.getByRole("button")).toHaveClass("button-icon");

        expect(screen.getByTestId("icon-ArrowUp")).toBeInTheDocument();
    });

    it("should render with transition", () => {
        render(
            <IconButton
                icon="ArrowUp"
                transitionTo="Metamask"
                transitionCriteria={true}
            >
                <span data-testid="test"></span>
            </IconButton>,
        );

        expect(screen.getByRole("button")).toBeTruthy();

        expect(screen.getByRole("button")).toHaveClass("button-icon");

        expect(screen.queryByTestId("icon-ArrowUp")).not.toBeInTheDocument();

        expect(screen.getByTestId("icon-Metamask")).toBeInTheDocument();
    });

    it.each(["primary", "secondary"])("should handle different variants", (variant) => {
        render(
            <IconButton
                icon="ArrowUp"
                variant={variant as "primary" | "secondary"}
            >
                Press me
            </IconButton>,
        );

        expect(screen.getByRole("button")).toHaveClass(`button-icon-${variant}`);
    });
});
