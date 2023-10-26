import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import { useInViewport } from "react-in-viewport";
import { ImageErrorPlaceholer } from "./Image.blocks";
import { type ImageProperties } from "./Image.contracts";
import { useImageLoader } from "./useImageLoader";
import { Skeleton } from "@/Components/Skeleton";
import { twMerge } from "tailwind-merge";

export const Img = ({
    src,
    alt,
    className,
    wrapperClassName,
    childWrapperClassName,
    errorClassName,
    errorMessage,
    onError,
    isCircle,
    ...properties
}: ImageProperties): JSX.Element => {
    const { isLoaded, isErrored, loadImage, isLoading } = useImageLoader({ src, onError });

    const [showSkeleton, setShowSkeleton] = useState(true);
    const reference = useRef(null);

    const { inViewport } = useInViewport(reference);

    useEffect(() => {
        if (inViewport && !isLoaded && !isErrored && !isLoading) {
            loadImage();
        }
    }, [inViewport]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setShowSkeleton(!isLoaded && !isErrored);
        }, 500);

        return () => {
            clearTimeout(timeout);
        };
    }, [isLoaded, isErrored]);

    return (
        <div
            ref={reference}
            className={cn("relative", wrapperClassName)}
            data-testid="ImgContainer"
        >
            {showSkeleton && (
                <Skeleton
                    isCircle={isCircle}
                    className={cn(className, "h-full")}
                />
            )}

            <div
                className={cn(
                    "inset-0 transition duration-1000",
                    isLoaded || isErrored ? "opacity-100" : "opacity-0",
                    {
                        absolute: showSkeleton,
                    },
                    childWrapperClassName,
                )}
            >
                {isLoaded && (
                    <img
                        data-testid="Img"
                        src={src ?? undefined}
                        alt={alt}
                        className={twMerge(className, "w-full")}
                        {...properties}
                    />
                )}

                {isErrored && (
                    <ImageErrorPlaceholer
                        errorMessage={errorMessage}
                        className={cn(className, errorClassName, "aspect-square")}
                    />
                )}
            </div>
        </div>
    );
};
