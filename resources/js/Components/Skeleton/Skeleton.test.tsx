import React from "react";
import { Skeleton } from "./Skeleton";
import { render, screen } from "@/Tests/testing-library";

describe("Skeleton", () => {
    it("should render", () => {
        const { asFragment } = render(<Skeleton />);

        expect(screen.getByTestId("Skeleton")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });

    it("should render circle", () => {
        const { asFragment } = render(<Skeleton isCircle />);

        expect(screen.getByTestId("Skeleton")).toBeInTheDocument();
        expect(asFragment()).toMatchSnapshot();
    });
});
