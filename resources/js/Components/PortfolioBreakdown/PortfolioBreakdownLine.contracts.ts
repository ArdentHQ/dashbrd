import cn from "classnames";

type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl";

const visibleBreakpointClasses: Record<BreakpointKey, string> = {
    sm: "sm:inline-block",
    md: "md:inline-block",
    lg: "lg:inline-block",
    xl: "xl:inline-block",
    "2xl": "2xl:inline-block",
};

const hiddenBreakpointClasses: Record<BreakpointKey, string> = {
    sm: "sm:hidden",
    md: "md:hidden",
    lg: "lg:hidden",
    xl: "xl:hidden",
    "2xl": "2xl:hidden",
};

export type Breakpoints = Record<BreakpointKey, number>;

export const getAssetBreakpointClasses = (breakpoints: Breakpoints, assetIndex: number): string | undefined => {
    const classNames: string[] = [];
    let previousWasVisible = true;
    for (const [breakpoint, count] of Object.entries(breakpoints)) {
        if (assetIndex >= count) {
            if (previousWasVisible) {
                classNames.push(hiddenBreakpointClasses[breakpoint as BreakpointKey]);

                previousWasVisible = false;
            }
        } else if (assetIndex < count && classNames.length > 0 && !previousWasVisible) {
            classNames.push(visibleBreakpointClasses[breakpoint as BreakpointKey]);

            previousWasVisible = true;
        }
    }

    if (classNames.length === 0) {
        return;
    }

    return cn(classNames);
};

export const getOtherAssetClasses = (breakpoints: Breakpoints, countToShow: number): string | undefined => {
    const classNames: string[] = [];
    let previousWasVisible = false;
    for (const [breakpoint, countCheck] of Object.entries(breakpoints)) {
        if (countToShow === countCheck) {
            if (!previousWasVisible) {
                classNames.push(visibleBreakpointClasses[breakpoint as BreakpointKey]);

                previousWasVisible = true;
            }
        } else if (previousWasVisible) {
            classNames.push(hiddenBreakpointClasses[breakpoint as BreakpointKey]);

            previousWasVisible = false;
        }
    }

    return cn("hidden", classNames);
};
