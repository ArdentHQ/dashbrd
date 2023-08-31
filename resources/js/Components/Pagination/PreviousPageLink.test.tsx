import React from "react";
import { PreviousPageLink } from "./PreviousPageLink";
import { render, screen } from "@/Tests/testing-library";

describe("Pagination__PreviousPageLink", () => {
    it("renders", () => {
        render(<PreviousPageLink href="/test" />);

        expect(screen.getByTestId("Pagination__PreviousPageLink__link")).toBeInTheDocument();
    });
});
