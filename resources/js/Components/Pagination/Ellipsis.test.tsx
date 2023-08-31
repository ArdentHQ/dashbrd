import React from "react";
import { Ellipsis } from "./Ellipsis";
import { render, screen } from "@/Tests/testing-library";

describe("Pagination__Ellipsis", () => {
    it("should render", () => {
        render(<Ellipsis />);

        expect(screen.getByTestId("Pagination__Ellipsis")).toBeInTheDocument();
    });
});
