import { render, screen } from "@testing-library/react";
import { Context as ResponsiveContext } from "react-responsive";
import { useGalleryCarousel } from "./use-gallery-carousel";

describe("use-gallery-carousel", () => {
    it.each([
        [
            375,
            {
                slidesPerView: "1",
                horizontalOffset: "24",
            },
        ],
        [
            640,
            {
                slidesPerView: "2",
                horizontalOffset: "32",
            },
        ],
        [
            768,
            {
                slidesPerView: "2",
                horizontalOffset: "32",
            },
        ],
        [
            960,
            {
                slidesPerView: "3",
                horizontalOffset: "32",
            },
        ],
        [
            1024,
            {
                slidesPerView: "3",
                horizontalOffset: "0",
            },
        ],
        [
            1280,
            {
                slidesPerView: "4",
                horizontalOffset: "0",
            },
        ],
    ])("should render for breakpoint %d", (width, expectations) => {
        const Component = (): JSX.Element => {
            const { slidesPerView, horizontalOffset } = useGalleryCarousel();

            return (
                <div>
                    <span data-testid="Test__slidesPerView">{slidesPerView}</span>
                    <span data-testid="Test__horizontalOffset">{horizontalOffset}</span>
                </div>
            );
        };

        render(
            <ResponsiveContext.Provider value={{ width }}>
                <Component />
            </ResponsiveContext.Provider>,
        );

        expect(screen.getByTestId("Test__slidesPerView")).toHaveTextContent(expectations.slidesPerView);
        expect(screen.getByTestId("Test__horizontalOffset")).toHaveTextContent(expectations.horizontalOffset);
    });
});
