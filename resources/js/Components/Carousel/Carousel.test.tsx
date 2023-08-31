import React from "react";
import { Carousel, CarouselControls, CarouselItem, CarouselNextButton, CarouselPreviousButton } from "./Carousel";
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
        expect(screen.getByTestId("CarouseNavigationButtons__previous")).toBeInTheDocument();
        expect(screen.getByTestId("CarouseNavigationButtons__next")).toBeInTheDocument();

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

        expect(screen.getByTestId("CarouseNavigationButtons__previous")).toHaveClass(
            `carousel-button-previous-${carouselKey}`,
        );

        expect(screen.getByTestId("CarouseNavigationButtons__next")).toHaveClass(`carousel-button-next-${carouselKey}`);
    });

    it("should render carousel controls", () => {
        render(<CarouselControls />);

        expect(screen.getByTestId("CarouseNavigationButtons__previous")).toHaveClass(`carousel-button-previous-1`);
        expect(screen.getByTestId("CarouseNavigationButtons__next")).toHaveClass(`carousel-button-next-1`);
    });

    it("should render carousel next button", () => {
        render(<CarouselNextButton />);

        expect(screen.getByTestId("CarouseNavigationButtons__next")).toBeInTheDocument();
    });

    it("should render carousel previous button", () => {
        render(<CarouselPreviousButton />);

        expect(screen.getByTestId("CarouseNavigationButtons__previous")).toBeInTheDocument();
    });
});
