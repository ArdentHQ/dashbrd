import React from "react";
import { NextPageLink } from "./NextPageLink";
import { render, screen } from "@/Tests/testing-library";

describe("Pagination__NextPageLink", () => {
    it("renders", () => {
        render(<NextPageLink href="/test" />);

        expect(screen.getByTestId("Pagination__NextPageLink__link")).toBeInTheDocument();
    });

    it("should be disabled if href is null", () => {
        render(<NextPageLink href={null} />);

        expect(screen.getByTestId("Pagination__NextPageLink__link")).toHaveAttribute("disabled");
    });
});
