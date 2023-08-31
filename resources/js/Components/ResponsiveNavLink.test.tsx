import React from "react";
import { ResponsiveNavLink } from "@/Components/ResponsiveNavLink";
import { render, screen } from "@/Tests/testing-library";

describe("ResponsiveNavLink", () => {
    it("should render", () => {
        render(
            <ResponsiveNavLink href="/">
                <span data-testid="test"></span>
            </ResponsiveNavLink>,
        );

        expect(screen.getByTestId("ResponsiveNavLink")).toBeInTheDocument();
        expect(screen.getByTestId("test")).toBeInTheDocument();
    });
});
