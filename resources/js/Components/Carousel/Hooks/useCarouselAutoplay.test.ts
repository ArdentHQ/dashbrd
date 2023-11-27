import { act, renderHook } from "@testing-library/react";

import Swiper from "swiper";
import { type Swiper as SwiperClass } from "swiper/types";
import { useCarouselAutoplay } from "./useCarouselAutoplay";

describe("useCarouselAutoplay", () => {
    it("should stay idle if carousel instance is not provided", () => {
        const { result } = renderHook(() => useCarouselAutoplay({ carouselInstance: undefined }));

        expect(result.current.activeIndex).toBe(0);
        expect(result.current.progress).toBe(0);
    });

    it("should provide progress and active index", () => {
        vi.useFakeTimers();

        const carouselInstance = new Swiper(".test");
        const starEventMock = vi.fn();

        const { result, rerender } = renderHook(() =>
            useCarouselAutoplay({
                carouselInstance: {
                    ...carouselInstance,
                    slides: ["" as unknown as HTMLElement, " " as unknown as HTMLElement],
                    on: (eventName: string, handler: (swiper: SwiperClass) => void) => {
                        handler(carouselInstance);
                    },
                    off: vi.fn(),
                    autoplay: {
                        ...carouselInstance.autoplay,
                        paused: false,
                        running: true,
                        start: starEventMock,
                    },
                },
                autoplayDelay: 1000,
            }),
        );

        expect(result.current.progress).toBe(0);
        expect(result.current.activeIndex).toBe(0);

        expect(starEventMock).toHaveBeenCalled();

        rerender(() =>
            useCarouselAutoplay({
                carouselInstance: undefined,
                autoplayDelay: 1000,
            }),
        );

        expect(result.current.progress).toBe(0);
        expect(result.current.activeIndex).toBe(0);
    });

    it("should not update progress if slider is paused or not running", () => {
        vi.useFakeTimers();

        const carouselInstance = new Swiper(".test");
        const starEventMock = vi.fn();
        const slides = ["" as unknown as HTMLElement, " " as unknown as HTMLElement];

        const { result } = renderHook(() =>
            useCarouselAutoplay({
                carouselInstance: {
                    ...carouselInstance,
                    slides,
                    on: (eventName: string, handler: (swiper: SwiperClass) => void) => {
                        handler({
                            ...carouselInstance,
                            slides,
                        });
                    },
                    off: vi.fn(),
                    autoplay: {
                        ...carouselInstance.autoplay,
                        paused: true,
                        running: false,
                        start: starEventMock,
                    },
                },
                autoplayDelay: 100,
            }),
        );

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(starEventMock).toHaveBeenCalled();

        expect(result.current.activeIndex).toBe(0);
        expect(result.current.progress).toBe(0);
    });

    it("should move to last slide", () => {
        vi.useFakeTimers();

        const carouselInstance = new Swiper(".test");
        const starEventMock = vi.fn();
        const slides = ["" as unknown as HTMLElement, " " as unknown as HTMLElement];

        const { result } = renderHook(() =>
            useCarouselAutoplay({
                carouselInstance: {
                    ...carouselInstance,
                    slides,
                    on: (eventName: string, handler: (swiper: SwiperClass) => void) => {
                        handler({
                            ...carouselInstance,
                            activeIndex: -1,
                            slides,
                        });
                    },
                    off: vi.fn(),
                    autoplay: {
                        ...carouselInstance.autoplay,
                        paused: false,
                        running: true,
                        start: starEventMock,
                    },
                },
                autoplayDelay: 100,
            }),
        );

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(starEventMock).toHaveBeenCalled();

        expect(result.current.activeIndex).toBe(2);
        expect(result.current.progress).toBe(0);
    });
});
