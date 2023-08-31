import React from "react";
import { IconLikeButton } from "@/Components/Buttons/IconLikeButton";
import { render, screen } from "@/Tests/testing-library";

describe("IconLikeButton", () => {
    it("should render", () => {
        render(
            <IconLikeButton icon="Heart">
                <span data-testid="test"></span>
            </IconLikeButton>,
        );

        expect(screen.getByRole("button")).toHaveClass("button-like");

        expect(screen.getByRole("button")).not.toHaveClass("button-like-selected");
    });

    it("should apply the selected class if selected", () => {
        render(
            <IconLikeButton
                icon="Heart"
                selected
            >
                <span data-testid="test"></span>
            </IconLikeButton>,
        );

        expect(screen.getByRole("button")).toHaveClass("button-like-selected");
    });
});
