import cn from "classnames";
import { forwardRef, type HTMLAttributes } from "react";
export type HeadingWeight = "bold" | "medium" | "normal";

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProperties extends HTMLAttributes<HTMLHeadingElement> {
    level: HeadingLevel;
    weight?: HeadingWeight;
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
    ({ level, children, weight = "medium", className, ...properties }, reference): JSX.Element => {
        if (level === 1) {
            return (
                <h1
                    ref={reference}
                    className={cn(
                        "text-xl leading-[1.875rem] text-theme-secondary-900 dark:text-theme-dark-50 md:text-2xl md:leading-8 lg:text-[2rem] lg:leading-[2.75rem]",
                        weightClass(weight),
                        className,
                    )}
                    {...properties}
                >
                    {children}
                </h1>
            );
        }

        if (level === 2) {
            return (
                <h2
                    ref={reference}
                    className={cn(
                        "text-xl leading-[1.875rem] text-theme-secondary-900 dark:text-theme-dark-50 md:text-2xl md:leading-8",
                        weightClass(weight),
                        className,
                    )}
                    {...properties}
                >
                    {children}
                </h2>
            );
        }

        if (level === 3) {
            return (
                <h3
                    ref={reference}
                    className={cn(
                        "text-lg leading-7 text-theme-secondary-900 dark:text-theme-dark-50 md:text-xl md:leading-[1.875rem]",
                        weightClass(weight),
                        className,
                    )}
                    {...properties}
                >
                    {children}
                </h3>
            );
        }

        return (
            <h4
                ref={reference}
                className={cn(
                    "text-base leading-7 text-theme-secondary-900 dark:text-theme-dark-50 sm:text-lg",
                    weightClass(weight),
                    className,
                )}
                {...properties}
            >
                {children}
            </h4>
        );
    },
);

Heading.displayName = "Heading";

export { Heading };
