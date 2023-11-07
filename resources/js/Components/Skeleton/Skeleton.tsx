import SkeletonReact from "react-loading-skeleton";
import { twMerge } from "tailwind-merge";
import { isTruthy } from "@/Utils/is-truthy";

interface SkeletonProperties {
    width?: string | number;
    height?: string | number;
    isCircle?: boolean;
    className?: string;
    animated?: boolean;
}

export const Skeleton = ({ isCircle, width, height, className, animated = true }: SkeletonProperties): JSX.Element => (
    <SkeletonReact
        enableAnimation={animated}
        containerTestId="Skeleton"
        circle={isCircle}
        style={{ width, height }}
        className={twMerge("z-0 dark:bg-theme-dark-800", !isTruthy(isCircle) ? "rounded-lg" : "", className)}
        duration={1.3}
        containerClassName="flex w-auto max-w-full items-center leading-none h-full"
    />
);
