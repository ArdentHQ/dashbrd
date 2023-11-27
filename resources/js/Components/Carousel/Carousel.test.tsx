import userEvent from "@testing-library/user-event";
import React from "react";
import Swiper from "swiper";
import {
    Carousel,
    CarouselControls,
    CarouselItem,
    CarouselNextButton,
    CarouselPagination,
    CarouselPreviousButton,
} from "./Carousel";
import * as useCarouselAutoplayMock from "./Hooks/useCarouselAutoplay";
import { render, screen } from "@/Tests/testing-library";

describe("Carousel", () => {
    it("should render", () => {
        render(
            <Carousel viewAllPath="/">
                <CarouselItem key="1">
                    <div data-testid="carousel-item" />
                </CarouselItem>
                <CarouselItem key="2">
                    <div data-testid="carousel-item" />
                </CarouselItem>
            </Carousel>,
        );

        expect(screen.getAllByTestId("CarouselControls__view-all")).toHaveLength(1);
        expect(screen.getByTestId("CarouselNavigationButtons__previous")).toBeInTheDocument();
        expect(screen.getByTestId("CarouselNavigationButtons__next")).toBeInTheDocument();

        expect(screen.getAllByTestId("carousel-item")).toHaveLength(2);
    });

    it("should render with unique carousel key", () => {
        const carouselKey = "10";
        render(
            <Carousel
                carouselKey={carouselKey}
                viewAllPath="/"
            >
                <CarouselItem key="1">
                    <div data-testid="carousel-item" />
                </CarouselItem>
            </Carousel>,
        );

        expect(screen.getByTestId("CarouselNavigationButtons__previous")).toHaveClass(
            `carousel-button-previous-${carouselKey}`,
        );

        expect(screen.getByTestId("CarouselNavigationButtons__next")).toHaveClass(
            `carousel-button-next-${carouselKey}`,
        );
    });

    it("should render carousel controls", () => {
        render(<CarouselControls />);

        expect(screen.getByTestId("CarouselNavigationButtons__previous")).toHaveClass(`carousel-button-previous-1`);
        expect(screen.getByTestId("CarouselNavigationButtons__next")).toHaveClass(`carousel-button-next-1`);
    });

    it("should render carousel next button", () => {
        render(<CarouselNextButton />);

        expect(screen.getByTestId("CarouselNavigationButtons__next")).toBeInTheDocument();
    });

    it("should render carousel previous button", () => {
        render(<CarouselPreviousButton />);

        expect(screen.getByTestId("CarouselNavigationButtons__previous")).toBeInTheDocument();
    });

    it("should render carousel pagination", () => {
        render(
            <CarouselPagination
                carouselInstance={{
                    ...new Swiper(".test"),
                    slides: ["" as unknown as HTMLElement, " " as unknown as HTMLElement],
                    on: vi.fn(),
                }}
                autoplayDelay={40}
            />,
        );

        expect(screen.getAllByTestId("CarouselPagination__item")).toHaveLength(2);
    });

    it("should not render carousel pagination if carousel instance is not provided", () => {
        render(<CarouselPagination />);

        expect(screen.queryByTestId("CarouselPagination__item")).not.toBeInTheDocument();
    });

    it("should slide to element when clicking pagination link", async () => {
        const slideToMock = vi.fn();
        render(
            <CarouselPagination
                carouselInstance={{
                    ...new Swiper(".test"),
                    slides: ["" as unknown as HTMLElement, " " as unknown as HTMLElement],
                    on: vi.fn(),
                    slideTo: slideToMock,
                }}
                autoplayDelay={40}
            />,
        );

        expect(screen.getAllByTestId("CarouselPagination__item")).toHaveLength(2);

        await userEvent.click(screen.getAllByTestId("CarouselPagination__item")[0]);
        expect(slideToMock).toHaveBeenCalled();
    });

    it("should render pagination with progress bar", () => {
        vi.spyOn(useCarouselAutoplayMock, "useCarouselAutoplay").mockImplementation(() => ({
            activeIndex: 0,
            progress: 50,
        }));

        render(
            <CarouselPagination
                carouselInstance={{
                    ...new Swiper(".test"),
                    slides: ["" as unknown as HTMLElement, " " as unknown as HTMLElement],
                    on: vi.fn(),
                }}
                autoplayDelay={40}
            />,
        );

        expect(screen.getAllByTestId("CarouselPagination__progress-bar")[0]).toHaveAttribute("style", "width: 50%;");
    });
});
