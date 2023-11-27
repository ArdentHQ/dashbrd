import { useCallback, useEffect, useState } from "react";

import { type Swiper as SwiperClass } from "swiper/types";
import { isTruthy } from "@/Utils/is-truthy";

/**
 * Provides autoplay state handling.
 * Returns progress until next slide change in percentage (based on autoPlayDelay),
 * and the active slides index.
 *
 */
export const useCarouselAutoplay = ({
    carouselInstance,
    autoplayDelay = 5000,
}: {
    carouselInstance?: SwiperClass;
    autoplayDelay?: number;
}): {
    progress: number;
    activeIndex: number;
} => {
    const [progress, setProgress] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    /**
     * Handle slide change event & ensure autoplay is always on,
     * and update state accordingly
     *
     * @param {SwiperClass} swiper
     * @returns {void}
     */
    const handleSlideChange = useCallback(
        (carousel: SwiperClass) => {
            const start = (): boolean | undefined => carouselInstance?.autoplay.start();

            /**
             * Update active slide index state.
             * activeIndex comes as -1 on the last slide. Corrects it to get the index of the last item.
             *
             * @param {SwiperClass} swiper
             * @returns {void}
             */
            const setActiveSlide = (swiper: SwiperClass): void => {
                const index = swiper.activeIndex < 0 ? swiper.slides.length : swiper.activeIndex;
                setActiveIndex(index);
                setProgress(0);
            };

            /**
             * Ensure autoplay is always on, as carousel can stop when
             * manually changing slides (either by clicking on next/previous links or pagination links)
             */
            carousel.on("autoplayStop", start);

            carousel.on("slideChange", setActiveSlide);

            return () => {
                // Clear all listeners and reset to defaults.
                carousel.off("autoplayStop", start);
                carousel.off("slideChange", setActiveSlide);
                setActiveIndex(0);
                setProgress(0);
            };
        },
        [carouselInstance],
    );

    /**
     * Update progress in percentage until next slide change.
     *
     * Although swiper emits `autoplayTimeLeft` with the percentage,
     * it's not resetting the timer when a manual slide change happens
     * (e.g when clicking next/previous arrows or pagination links).
     *
     * @param {SwiperClass} swiper
     * @returns {void}
     */
    const updateProgress = useCallback(
        (carousel: SwiperClass) => {
            const progressUpdateInterval = 200;

            const interval = setInterval(() => {
                if (carousel.autoplay.paused || !carousel.autoplay.running) {
                    return;
                }

                const progressPercentageStep = (100 / autoplayDelay) * progressUpdateInterval;
                setProgress((currentProgress) => Math.round(currentProgress + progressPercentageStep));
            }, progressUpdateInterval);

            return () => {
                clearInterval(interval);
            };
        },
        [carouselInstance],
    );

    /**
     * Start listening to slide change events,
     * and calculate & update active slide's progress.
     */
    useEffect(() => {
        if (!isTruthy(carouselInstance)) {
            return;
        }

        handleSlideChange(carouselInstance);
        updateProgress(carouselInstance);
    }, [carouselInstance]);

    return {
        progress,
        activeIndex,
    };
};
