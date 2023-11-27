import { renderHook } from "@testing-library/react";

import { useCarouselAutoplay } from "./useCarouselAutoplay";
import Swiper from "swiper";
import { type Swiper as SwiperClass } from "swiper/types";

describe("useCarouselAutoplay", () => {
    it("should stay idle if carousel instance is not provided", () => {
        const { result } = renderHook(() => useCarouselAutoplay({ carouselInstance: undefined }));

        expect(result.current.activeIndex).toBe(0);
        expect(result.current.progress).toBe(0);
    });

    it("should stay idle if carousel instance is not provided", () => {
        const carouselInstance = new Swiper(".test");
        const starEventMock = vi.fn();

        const { result, rerender } = renderHook(() =>
            useCarouselAutoplay({
                carouselInstance: {
                    ...carouselInstance,
                    slides: ["" as unknown as HTMLElement, " " as unknown as HTMLElement],
                    on: (eventName: string, handler: (swiper: SwiperClass) => void) => {
                        handler?.(carouselInstance);
                    },
                    autoplay: {
                        ...carouselInstance.autoplay,
                        start: starEventMock,
                    },
                },
                autoplayDelay: 1,
            }),
        );

        expect(result.current.activeIndex).toBe(0);
        expect(starEventMock).toHaveBeenCalled();
    });
});
