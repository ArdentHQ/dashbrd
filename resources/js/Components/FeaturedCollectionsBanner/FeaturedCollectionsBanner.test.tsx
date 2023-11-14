import React from "react";
import { FeaturedCollectionsBanner } from "./FeaturedCollectionsBanner";
import { CollectionCarousel } from "./FeaturedCollectionsBanner.blocks";
import * as CarouselMock from "@/Components/Carousel";
import NFTCollectionFactory from "@/Tests/Factories/Nfts/NFTCollectionFactory";
import { render, screen, userEvent, waitFor } from "@/Tests/testing-library";
import { allBreakpoints } from "@/Tests/utils";

describe("FeaturedCollectionsBanner", () => {
    it("should render", () => {
        render(<FeaturedCollectionsBanner />);

        expect(screen.getByTestId("FeaturedCollectionsBanner")).toBeInTheDocument();
        expect(screen.getByTestId("FeaturedCollectionsBanner__heading")).toBeInTheDocument();
        expect(screen.getByText("This gallery consists of 0 collections")).toBeInTheDocument();
    });

    it("should render with 1 collection", () => {
        const collections = new NFTCollectionFactory().withImage().createMany(1);

        render(<FeaturedCollectionsBanner collections={collections} />);

        expect(screen.getByTestId("FeaturedCollectionsBanner")).toBeInTheDocument();
        expect(screen.getByTestId("FeaturedCollectionsBanner__heading")).toBeInTheDocument();
        expect(screen.getByText("This gallery consists of 1 collection")).toBeInTheDocument();
        expect(screen.getByTestId("CollectionCarousel__entry--0")).toBeInTheDocument();
        expect(screen.queryByTestId("CollectionCarousel__entry--1")).not.toBeInTheDocument();
    });

    it("should render with the given subtitle", () => {
        const collections = new NFTCollectionFactory().withImage().createMany(1);

        render(
            <FeaturedCollectionsBanner
                collections={collections}
                subtitle="Test title for article"
            />,
        );

        expect(screen.getByText("Test title for article")).toBeInTheDocument();
    });

    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        render(<FeaturedCollectionsBanner collections={[]} />, { breakpoint });

        expect(screen.getByTestId("FeaturedCollectionsBanner")).toBeInTheDocument();
    });

    describe.each([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])("multiple collections", (collectionsCount) => {
        it.each(allBreakpoints)("should render multiple collections in %s screen with image urls", (breakpoint) => {
            const collections = new NFTCollectionFactory().withImage().createMany(collectionsCount);

            render(<FeaturedCollectionsBanner collections={collections} />, { breakpoint });

            for (let index = 0; index < collectionsCount; index++) {
                expect(screen.getByTestId(`CollectionCarousel__entry--${index}`)).toBeInTheDocument();
                expect(
                    screen.getByText(`This gallery consists of ${collectionsCount} collections`),
                ).toBeInTheDocument();
            }
        });
    });

    describe.each([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])("multiple collections", (collectionsCount) => {
        it.each(allBreakpoints)("should render multiple collections in %s screen without image urls", (breakpoint) => {
            const collections = new NFTCollectionFactory().withoutImage().createMany(collectionsCount);

            render(<FeaturedCollectionsBanner collections={collections} />, { breakpoint });

            for (let index = 0; index < collectionsCount; index++) {
                expect(
                    screen.getByText(`This gallery consists of ${collectionsCount} collections`),
                ).toBeInTheDocument();
            }
        });
    });
});

describe("CollectionCarousel", () => {
    const collections = new NFTCollectionFactory().createMany(1);

    it.each(allBreakpoints)("should render in %s screen", (breakpoint) => {
        render(<CollectionCarousel />, { breakpoint });

        expect(screen.getByTestId("CollectionCarousel")).toBeInTheDocument();
    });

    it("checks if requires carousel", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.spyOn(CarouselMock, "Carousel").mockImplementation((properties: any) => (
            <div
                data-testid="Carousel"
                onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    properties.onUpdate({ isLocked: false });
                }}
            />
        ));

        render(<CollectionCarousel collections={collections} />);

        expect(screen.getByTestId("CollectionCarousel--button--hidden")).toBeInTheDocument();

        expect(screen.getByTestId("Carousel")).toBeInTheDocument();

        await userEvent.click(screen.getByTestId("Carousel"));

        await waitFor(() => {
            expect(screen.queryByTestId("CollectionCarousel--button--hidden")).not.toBeInTheDocument();
        });

        expect(screen.getByTestId("CollectionCarousel--button")).toBeInTheDocument();
    });
});
