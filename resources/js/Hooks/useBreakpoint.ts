import { useMediaQuery } from "react-responsive";
import { isTruthy } from "@/Utils/is-truthy";

export const useBreakpoint = (): {
    is2Xs: boolean;
    isXs: boolean;
    isXsAndAbove: boolean;
    isSm: boolean;
    isSmAndAbove: boolean;
    isMd: boolean;
    isMdLg: boolean;
    isMdAndAbove: boolean;
    isMdLgAndAbove: boolean;
    isLg: boolean;
    isLgAndAbove: boolean;
    isXl: boolean;
    isXlAndAbove: boolean;
    is2Xl: boolean;
    isMinWidth: (minWidth: number) => boolean;
    isTouch: boolean;
} => {
    const is2Xs = useMediaQuery({ maxWidth: 374 });
    const isXs = useMediaQuery({ minWidth: 375, maxWidth: 639 });
    const isSm = useMediaQuery({ minWidth: 640, maxWidth: 767 });
    const isMd = useMediaQuery({ minWidth: 768, maxWidth: 959 });
    const isMdLg = useMediaQuery({ minWidth: 960, maxWidth: 1023 });
    const isLg = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
    const isXl = useMediaQuery({ minWidth: 1280, maxWidth: 1439 });
    const is2Xl = useMediaQuery({ minWidth: 1440 });

    const isMinWidth = (minWidth: number): boolean => useMediaQuery({ minWidth });

    const isXsAndAbove = !is2Xs;
    const isSmAndAbove = isXsAndAbove && !isXs;
    const isMdAndAbove = isSmAndAbove && !isSm;
    const isMdLgAndAbove = isMdAndAbove && !isMd;
    const isLgAndAbove = isMdLgAndAbove && !isMdLg;
    const isXlAndAbove = isLgAndAbove && !isLg;

    const isTouch = isTruthy(window.matchMedia("(any-hover: none)").matches) || is2Xs || isXs || isSm;

    return {
        is2Xs,
        isXs,
        isXsAndAbove,
        isSm,
        isSmAndAbove,
        isMd,
        isMdAndAbove,
        isMdLg,
        isMdLgAndAbove,
        isLg,
        isLgAndAbove,
        isXl,
        isXlAndAbove,
        is2Xl,
        isMinWidth,
        isTouch,
    };
};
