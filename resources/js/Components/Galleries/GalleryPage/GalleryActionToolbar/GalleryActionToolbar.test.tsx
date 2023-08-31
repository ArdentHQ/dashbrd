import React from "react";
import { GalleryActionToolbar } from "./GalleryActionToolbar";
import { render, screen } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

describe("GalleryActionToolbar", () => {
    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        render(<GalleryActionToolbar />, { breakpoint });

        expect(screen.getByTestId("GalleryActionToolbar")).toBeInTheDocument();
    });

    it("should render with gallery cover image url", () => {
        render(<GalleryActionToolbar galleryCoverUrl="/test" />);

        expect(screen.getByTestId("Img")).toBeInTheDocument();
        expect(screen.getByTestId("Img")).toHaveAttribute("src", "/test");
    });

    it("should render as processing", () => {
        render(
            <GalleryActionToolbar
                galleryCoverUrl="/test"
                isProcessing
            />,
        );

        expect(screen.getByTestId("GalleryActionToolbar__publish")).toBeInTheDocument();
        expect(screen.getByTestId("GalleryActionToolbar__publish")).toBeDisabled();
    });

    it.each(allBreakpoints)("should render without delete button in %s screen", (breakpoint) => {
        render(<GalleryActionToolbar showDelete={false} />, { breakpoint });

        expect(screen.queryByTestId("GalleryActionToolbar__delete")).not.toBeInTheDocument();
    });
});
