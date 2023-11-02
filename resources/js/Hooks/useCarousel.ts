import { useMemo } from "react";
import { useBreakpoint } from "@/Hooks/useBreakpoint";

export const useCarousel = (): { slidesPerView: number; horizontalOffset: number } => {
    const { is2Xs, isXs, isSm, isMd, isMdLg, isLg, isLgAndAbove } = useBreakpoint();

    const slidesPerView = useMemo(() => {
        if (is2Xs || isXs) {
            return 1;
        }

        if (isSm || isMd) {
            return 2;
        }

        if (isMdLg || isLg) {
            return 3;
        }

        return 4;
    }, [is2Xs, isXs, isSm, isMd, isMdLg, isLg]);

    const horizontalOffset = useMemo(() => {
        if (is2Xs || isXs) {
            return 24;
        }

        if (isLgAndAbove) {
            return 0;
        }

        return 32;
    }, [is2Xs, isXs, isLgAndAbove]);

    return {
        slidesPerView,
        horizontalOffset,
    };
};
