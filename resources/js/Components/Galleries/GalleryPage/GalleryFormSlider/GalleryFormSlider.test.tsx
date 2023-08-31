import React from "react";
import { GalleryFormSlider } from "./GalleryFormSlider";
import { GalleryFormSliderTabs } from "./GalleryFormSlider.contracts";
import { render, screen } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

describe("GalleryFormSlider", () => {
    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        render(
            <GalleryFormSlider
                isOpen
                onClose={vi.fn()}
            />,
            { breakpoint },
        );

        expect(screen.getByTestId("GalleryFormSlider")).toBeInTheDocument();
    });

    it.each(allBreakpoints)("should render gallery cover tab in %s screen", (breakpoint) => {
        render(
            <GalleryFormSlider
                activeTab={GalleryFormSliderTabs.Cover}
                isOpen
                onClose={vi.fn()}
            />,
            { breakpoint },
        );

        expect(screen.getByTestId("GalleryUploadCover")).toBeInTheDocument();
    });
});
