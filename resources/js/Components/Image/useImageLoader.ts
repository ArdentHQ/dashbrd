import { useCallback, useState } from "react";
import { isTruthy } from "@/Utils/is-truthy";
import { isUnit } from "@/Utils/test-helpers";

export const useImageLoader = ({
    onError,
    src,
}: {
    src?: string | null;
    onError?: () => void;
}): {
    isLoaded: boolean;
    isErrored: boolean;
    isLoading: boolean;
    loadImage: () => void;
} => {
    const [isLoaded, setIsImageLoaded] = useState(false);
    const [isErrored, setIsErrored] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadImage = useCallback(() => {
        if (isUnit()) {
            setIsLoading(false);
            setIsImageLoaded(true);
            return;
        }

        if (!isTruthy(src)) {
            setIsLoading(false);
            setIsErrored(true);
            onError?.();
            return;
        }

        setIsLoading(true);

        const image = new Image();

        image.src = src;

        image.onload = () => {
            setIsLoading(false);
            setIsImageLoaded(true);
        };

        image.onerror = () => {
            setIsErrored(true);
            setIsLoading(false);
            setIsImageLoaded(false);
            onError?.();
        };
    }, [src]);

    return {
        isLoaded,
        isErrored,
        loadImage,
        isLoading,
    };
};
