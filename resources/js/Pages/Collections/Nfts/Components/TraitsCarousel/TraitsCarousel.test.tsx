import React from "react";
import { TraitsCarousel } from "./TraitsCarousel";
import CollectionTraitDataFactory from "@/Tests/Factories/CollectionTraitDataFactory";
import { render, screen } from "@/Tests/testing-library";
import { allBreakpoints, type Breakpoint } from "@/Tests/utils";

describe("TraitsCarousel", () => {
    const traits = new CollectionTraitDataFactory().createMany(6);

    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        render(<TraitsCarousel />, { breakpoint });

        expect(screen.getByTestId("TraitsCarousel")).toBeInTheDocument();
    });

    it("should render without control buttons when not needed", () => {
        render(<TraitsCarousel traits={traits.slice(0, 4)} />, { breakpoint: "lg" as Breakpoint });

        expect(screen.getByTestId("TraitsCarousel__controls")).toHaveClass("hidden");
    });

    it("should render with control buttons when needed", () => {
        render(<TraitsCarousel traits={traits} />, { breakpoint: "lg" as Breakpoint });

        expect(screen.getByTestId("TraitsCarousel__controls")).toHaveClass("flex");
    });

    it("should show a message when NFT has no traits", () => {
        render(<TraitsCarousel traits={[]} />, { breakpoint: "lg" as Breakpoint });
        expect(screen.getByTestId("TraitsCarousel_hasNoTraits")).toBeInTheDocument();
    });
});
