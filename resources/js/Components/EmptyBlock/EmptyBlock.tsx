import cn from "classnames";
import { type HTMLAttributes } from "react";

interface Properties extends HTMLAttributes<HTMLDivElement> {
    textClasses?: string;
}

export const EmptyBlock = ({
    children,
    className,
    textClasses = "text-sm md:text-base",
    ...properties
}: Properties): JSX.Element => (
    <div
        data-testid="EmptyBlock"
        className={cn(
            "rounded-xl border border-theme-secondary-300 p-4 text-center font-medium text-theme-secondary-700 dark:border-theme-dark-700 dark:text-theme-dark-200",
            textClasses,
            className,
        )}
        {...properties}
    >
        {children}
    </div>
);
