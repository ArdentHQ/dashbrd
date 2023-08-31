import React from "react";
import { Heading } from "./Heading";
import { render } from "@/Tests/testing-library";

describe("Heading", () => {
    it("should render h1", () => {
        const { asFragment } = render(<Heading level={1} />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render h2", () => {
        const { asFragment } = render(<Heading level={2} />);

        expect(asFragment()).toMatchSnapshot();
    });
    it("should render h3", () => {
        const { asFragment } = render(<Heading level={3} />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render h4", () => {
        const { asFragment } = render(<Heading level={4} />);

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render h1 as bold", () => {
        const { asFragment } = render(
            <Heading
                level={1}
                weight="bold"
            />,
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render h1 as normal", () => {
        const { asFragment } = render(
            <Heading
                level={1}
                weight="normal"
            />,
        );

        expect(asFragment()).toMatchSnapshot();
    });

    it("should render h1 as medium", () => {
        const { asFragment } = render(
            <Heading
                level={1}
                weight="medium"
            />,
        );

        expect(asFragment()).toMatchSnapshot();
    });
});
