import cn from "classnames";
import { createElement, forwardRef, type HTMLAttributes } from "react";
export type HeadingWeight = "bold" | "medium" | "normal";

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProperties extends HTMLAttributes<HTMLHeadingElement> {
    level: HeadingLevel;
    weight?: HeadingWeight;
    as?: "h1" | "h2" | "h3" | "h4";
}

const weightClass = (weight: HeadingWeight): string => {
    if (weight === "bold") {
        return "font-bold";
    }

    if (weight === "medium") {
        return "font-medium";
    }

    return "font-normal";
};

const Heading = forwardRef<HTMLHeadingElement, HeadingProperties>(
    ({ level, weight = "medium", as, className, ...properties }, reference): JSX.Element => {
        if (level === 1) {
            return createElement(as ?? "h1", {
                ref: reference,
                className: cn(
                    "break-words text-xl leading-[1.875rem] text-theme-secondary-900 dark:text-theme-dark-50 md:text-2xl md:leading-8 lg:text-[2rem] lg:leading-[2.75rem]",
                    weightClass(weight),
                    className,
                ),
                ...properties,
            });
        }

        if (level === 2) {
            return createElement(as ?? "h2", {
                ref: reference,
                className: cn(
                    "text-xl leading-[1.875rem] text-theme-secondary-900 dark:text-theme-dark-50 md:text-2xl md:leading-8",
                    weightClass(weight),
                    className,
                ),
                ...properties,
            });
        }

        if (level === 3) {
            return createElement(as ?? "h3", {
                ref: reference,
                className: cn(
                    "text-lg leading-7 text-theme-secondary-900 dark:text-theme-dark-50 md:text-xl md:leading-[1.875rem]",
                    weightClass(weight),
                    className,
                ),
                ...properties,
            });
        }

        return createElement(as ?? "h4", {
            ref: reference,
            className: cn(
                "text-base leading-7 text-theme-secondary-900 dark:text-theme-dark-50 sm:text-lg",
                weightClass(weight),
                className,
            ),
            ...properties,
        });
    },
);

Heading.displayName = "Heading";

export { Heading };
