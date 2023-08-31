import React from "react";
import { GalleryCoverImage } from "./GalleryCoverImage";
import { render, screen } from "@/Tests/testing-library";

describe("GalleryCoverImage", () => {
    it("should render", () => {
        render(<GalleryCoverImage image={"some_image"} />);

        expect(screen.getByTestId("GalleryCoverImage")).toBeInTheDocument();
    });
});
