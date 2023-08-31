import React from "react";
import { LikeButton } from "@/Components/Buttons/LikeButton";
import { render, screen } from "@/Tests/testing-library";

describe("LikeButton", () => {
    it("should render", () => {
        render(<LikeButton icon="Heart">345</LikeButton>);

        expect(screen.getByRole("button")).toHaveClass("button-like");
    });
});
