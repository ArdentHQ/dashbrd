import React from "react";
import { NavLink } from "@/Components/Layout/NavLink";
import { render, screen } from "@/Tests/testing-library";

describe("NavLink", () => {
    it("should render", () => {
        render(
            <NavLink
                href="/"
                active={false}
            >
                <span data-testid="test" />
            </NavLink>,
        );

        expect(screen.getByTestId("NavLink")).toBeInTheDocument();
        expect(screen.getByTestId("test")).toBeInTheDocument();
    });

    it("should render as active", () => {
        const { asFragment } = render(
            <NavLink
                href="/"
                active
            >
                <span data-testid="test" />
            </NavLink>,
        );

        expect(screen.getByTestId("NavLink")).toBeInTheDocument();
        expect(screen.getByTestId("test")).toBeInTheDocument();

        expect(asFragment()).toMatchSnapshot();
    });
});
