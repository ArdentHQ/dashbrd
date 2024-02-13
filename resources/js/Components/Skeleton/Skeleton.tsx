import SkeletonReact from "react-loading-skeleton";
import { twMerge } from "tailwind-merge";

interface SkeletonProperties {
    width?: string | number;
    height?: string | number;
    isCircle?: boolean;
    animated?: boolean;
    className?: string;
}

export const Skeleton = ({
    width,
    height,
    animated = true,
    isCircle = false,
    className,
}: SkeletonProperties): JSX.Element => (
    <SkeletonReact
        enableAnimation={animated}
        containerTestId="Skeleton"
        circle={isCircle}
        style={{ width, height }}
        className={twMerge("z-0 dark:bg-theme-dark-800", "rounded-lg", className)}
        duration={1.3}
        containerClassName="flex w-auto max-w-full items-center leading-none h-full"
    />
);
