import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import { useInViewport } from "react-in-viewport";
import { twMerge } from "tailwind-merge";
import { ImageErrorPlaceholder } from "./Image.blocks";
import { type ImageProperties } from "./Image.contracts";
import { useImageLoader } from "./useImageLoader";
import { Skeleton } from "@/Components/Skeleton";
import { isTruthy } from "@/Utils/is-truthy";

export const Img = ({
    src,
    srcSet,
    alt,
    className,
    wrapperClassName,
    childWrapperClassName,
    errorClassName,
    errorMessage,
    onError,
    isCircle,
    errorPlaceholder,
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
            className={twMerge(wrapperClassName, "relative")}
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
                    "absolute inset-0 transition duration-1000",
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
                        srcSet={srcSet}
                        alt={alt}
                        className={twMerge(className, "h-full w-full object-cover ")}
                        {...properties}
                    />
                )}

                {isErrored && (
                    <>
                        {!isTruthy(errorPlaceholder) && (
                            <ImageErrorPlaceholder
                                errorMessage={errorMessage}
                                className={cn(className, errorClassName, "h-full w-full")}
                            />
                        )}

                        {isTruthy(errorPlaceholder) && errorPlaceholder}
                    </>
                )}
            </div>
        </div>
    );
};
