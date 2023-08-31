import React from "react";
import { Toggle } from "@/Components/Form/Toggle";
import { render, screen } from "@/Tests/testing-library";

describe("Toggle", () => {
    it("should render as checked", () => {
        const { asFragment } = render(
            <Toggle
                checked
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByTestId("Toggle")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render as unchecked", () => {
        const { asFragment } = render(
            <Toggle
                checked={false}
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByTestId("Toggle")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render as disabled", () => {
        const { asFragment } = render(
            <Toggle
                disabled
                checked
                onChange={vi.fn()}
            />,
        );

        expect(screen.getByTestId("Toggle")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });
});
