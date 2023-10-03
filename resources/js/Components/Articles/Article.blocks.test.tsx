import React from "react";
import { expect } from "vitest";
import {
    calculateCircleCount,
    FeaturedCollections,
    MoreCollectionsLabel,
} from "@/Components/Articles/ArticleCard.blocks";
import { render, screen } from "@/Tests/testing-library";

describe("ArticleCardBlocks", () => {
    it("should calculate featured collection counts", () => {
        expect(calculateCircleCount(10, 140)).toBe(4);
        expect(calculateCircleCount(5, 150)).toBe(5);
        expect(calculateCircleCount(2, 45)).toBe(2);
    });

    it("should render FeaturedCollections", () => {
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

describe("MoreCollectionsLabel", () => {
    it("should render MoreCollectionsLabel", () => {
        render(
            <MoreCollectionsLabel
                total={10}
                visible={3}
            />,
        );
        expect(screen.getByTestId("MoreCollectionsLabel")).toBeInTheDocument();
    });

    it("should not render MoreCollectionsLabel if diff of total and visible is less than 1", () => {
        render(
            <MoreCollectionsLabel
                total={5}
                visible={5}
            />,
        );
        expect(screen.queryByTestId("MoreCollectionsLabel")).not.toBeInTheDocument();
    });
});
