import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

export const Point = ({ className, ...properties }: ComponentProps<"span">): JSX.Element => (
    <span
        className={twMerge(
            "block h-[5px] w-[5px] rounded-full bg-theme-secondary-400 dark:bg-theme-dark-700",
            className,
        )}
        {...properties}
    />
);
