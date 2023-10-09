import cn from "classnames";
import SkeletonReact from "react-loading-skeleton";
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
        className={cn("z-0 dark:bg-theme-dark-800", className, {
            "rounded-lg": !isTruthy(isCircle),
        })}
        duration={1.3}
        containerClassName="flex w-auto max-w-full items-center leading-none"
    />
);
