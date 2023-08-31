import React from "react";
import { Footer } from "@/Components/Layout/Footer";
import { render, screen } from "@/Tests/testing-library";

describe("Footer", () => {
    it("should render", () => {
        render(<Footer />);

        expect(screen.getByTestId("Footer")).toBeInTheDocument();
    });
});
