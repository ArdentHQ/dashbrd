export type BreakpointName = "xl" | "lg" | "md" | "sm" | "xs";

export enum Breakpoint {
    xl = "xl",
    lg = "lg",
    md = "md",
    mdLg = "md-lg",
    sm = "sm",
    xs = "xs",
}

export const allBreakpoints = [
    Breakpoint.xl,
    Breakpoint.lg,
    Breakpoint.mdLg,
    Breakpoint.md,
    Breakpoint.sm,
    Breakpoint.xs,
];

export const breakpointWidth = (breakpoint?: Breakpoint): number => {
    if (breakpoint === Breakpoint.xl) {
        return 1280;
    }

    if (breakpoint === Breakpoint.lg) {
        return 1024;
    }

    if (breakpoint === Breakpoint.mdLg) {
        return 960;
    }

    if (breakpoint === Breakpoint.md) {
        return 768;
    }

    if (breakpoint === Breakpoint.sm) {
        return 640;
    }

    if (breakpoint === Breakpoint.xs) {
        return 375;
    }

    return 1280;
};
