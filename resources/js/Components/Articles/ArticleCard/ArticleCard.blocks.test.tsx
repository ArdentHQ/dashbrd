import React from "react";
import { expect, type SpyInstance } from "vitest";
import { calculateCircleCount, FeaturedCollections } from "@/Components/Articles/ArticleCard/ArticleCard.blocks";
import { type ArticleCardCollections } from "@/Components/Articles/ArticleCard/ArticleCardContracts";
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

    it("should display count of the collections that fit the available space", () => {
        render(
            <FeaturedCollections
                collections={
                    Array.from({ length: 2 }).fill({
                        name: "Collection 1",
                        image: "image",
                    }) as ArticleCardCollections
                }
            />,
        );

        expect(screen.queryByTestId("FeaturedCollections_Hidden")).not.toBeInTheDocument();
    });

    it("should call resize to fit featured collections within the available space", () => {
        const resizeObserverMock: SpyInstance = vi.spyOn(window, "ResizeObserver");

        const observeMock = vi.fn();

        resizeObserverMock.mockImplementation(() => ({
            observe: observeMock,
            disconnect: vi.fn(),
        }));

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

        expect(observeMock).toHaveBeenCalled();

        resizeObserverMock.mockRestore();
    });
});
