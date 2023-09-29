import React from "react";
import { expect } from "vitest";
import { calculateCircleCount, FeaturedCollections } from "@/Components/Articles/ArticleCard/ArticleCard.blocks";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleCardBlocks", () => {
    it("should calculate featured collection counts", () => {
        expect(calculateCircleCount(10, 140)).toBe(4);
        expect(calculateCircleCount(5, 150)).toBe(5);
    });

    it("should render FeaturedCollections element", () => {
        render(
            <FeaturedCollections
                collections={[
                    {
                        name: "Collection 1",
                        image: "image",
                    },
                ]}
            />,
        );

        expect(screen.getByTestId("FeaturedCollections")).toBeInTheDocument();
    });
});
